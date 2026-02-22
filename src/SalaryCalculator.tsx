import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, LogOut, Calculator, Calendar, CheckCircle2, Baby, Info, ArrowRight } from "lucide-react";

interface AuthState {
  token: string | null;
  user: { id: string; email: string } | null;
}

const API_URL = "http://localhost:3001";

interface Bonus {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
}

interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
}

interface SalarySacrifice {
  id: string;
  name: string;
  amount: number;
  type: "pension" | "ev" | "charity" | "other";
}

interface YearlyIncomeData {
  baseSalary: number;
  bonuses: Bonus[];
  carAllowance: number;
  employeePensionPercent: number;
  employerPensionPercent: number;
  savings: SavingsAccount[];
  sacrifices: SalarySacrifice[];
}

interface IncomeState {
  name: string;
  yearlyData: Record<string, YearlyIncomeData>;
}

interface ChildcareChild {
  id: string;
  name: string;
  daysPerWeek: number;
  dailyCost: number;
  topUpCost: number;
}

interface ChildcareData {
  children: ChildcareChild[];
}

const TAX_YEARS = ["2022/23", "2023/24", "2024/25", "2025/26", "2026/27"];
const DEFAULT_YEAR = "2025/26";

const TAX_YEAR_CONFIG: Record<string, any> = {
  "2022/23": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 150000,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.12,
    niRate2: 0.02,
    pensionAllowance: 40000,
  },
  "2023/24": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.1,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2024/25": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2025/26": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2026/27": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
};

const initialYearlyData = (): YearlyIncomeData => ({
  baseSalary: 0,
  bonuses: [],
  carAllowance: 0,
  employeePensionPercent: 0,
  employerPensionPercent: 0,
  savings: [],
  sacrifices: [],
});

const initialIncomeState = (defaultName: string): IncomeState => ({
  name: defaultName,
  yearlyData: TAX_YEARS.reduce(
    (acc, year) => ({
      ...acc,
      [year]: initialYearlyData(),
    }),
    {},
  ),
});

export function SalaryCalculator() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("babytax_auth");
    return saved ? JSON.parse(saved) : { token: null, user: null };
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [numPeople, setNumPeople] = useState<1 | 2>(1);
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [person1, setPerson1] = useState<IncomeState>(
    initialIncomeState("Person 1"),
  );
  const [person2, setPerson2] = useState<IncomeState>(
    initialIncomeState("Person 2"),
  );
  const [childcare, setChildcare] = useState<ChildcareData>({
    children: [],
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/calculation`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (data.id) {
        setNumPeople(data.numPeople);
        if (data.childcareData) setChildcare(data.childcareData);
        const mergeData = (prev: IncomeState, newData: any) => ({
          ...prev,
          name: newData.name || prev.name,
          yearlyData: {
            ...prev.yearlyData,
            ...(newData.yearlyData || {}),
          },
        });
        if (data.person1Data)
          setPerson1((prev) => mergeData(prev, data.person1Data));
        if (data.person2Data)
          setPerson2((prev) => mergeData(prev, data.person2Data));
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const saveData = async () => {
    if (!auth.token) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/calculation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          numPeople,
          person1Data: person1,
          person2Data: numPeople === 2 ? person2 : null,
          childcareData: childcare,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!auth.token) return;
    const timer = setTimeout(() => {
      saveData();
    }, 2000); // 2 second debounce
    return () => clearTimeout(timer);
  }, [person1, person2, numPeople, childcare, auth.token]);

  useEffect(() => {
    if (auth.token) {
      localStorage.setItem("babytax_auth", JSON.stringify(auth));
      fetchData();
    } else {
      localStorage.removeItem("babytax_auth");
    }
  }, [auth.token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegistering ? "/auth/register" : "/auth/login";
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAuth(data);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    setPerson1(initialIncomeState("Person 1"));
    setPerson2(initialIncomeState("Person 2"));
    setNumPeople(1);
    setChildcare({ children: [] });
  };

  const getYearlyData = (person: IncomeState, year: string) => {
    return person.yearlyData[year] || initialYearlyData();
  };

  const updateYearlyData = (
    personNum: 1 | 2,
    year: string,
    updates: Partial<YearlyIncomeData>,
  ) => {
    const updater = (prev: IncomeState) => ({
      ...prev,
      yearlyData: {
        ...prev.yearlyData,
        [year]: {
          ...getYearlyData(prev, year),
          ...updates,
        },
      },
    });

    if (personNum === 1) setPerson1(updater);
    else setPerson2(updater);
  };

  const updatePersonName = (personNum: 1 | 2, name: string) => {
    if (personNum === 1) setPerson1((prev) => ({ ...prev, name }));
    else setPerson2((prev) => ({ ...prev, name }));
  };

  const calculateBonusAmount = (bonus: Bonus, baseSalary: number) => {
    return bonus.type === "percentage"
      ? (baseSalary * bonus.value) / 100
      : bonus.value;
  };

  const calculateSavingsInterest = (yearlyData: YearlyIncomeData) => {
    return yearlyData.savings.reduce(
      (sum, s) => sum + (s.balance * s.interestRate) / 100,
      0,
    );
  };

  const calculateTotalGross = (yearlyData: YearlyIncomeData) => {
    const totalBonuses = yearlyData.bonuses.reduce(
      (sum, b) => sum + calculateBonusAmount(b, yearlyData.baseSalary),
      0,
    );
    return (
      yearlyData.baseSalary +
      totalBonuses +
      yearlyData.carAllowance +
      calculateSavingsInterest(yearlyData)
    );
  };

  const calculateYearlyPensionContribution = (yearlyData: YearlyIncomeData) => {
    const employee =
      (yearlyData.baseSalary * yearlyData.employeePensionPercent) / 100;
    const employer =
      (yearlyData.baseSalary * yearlyData.employerPensionPercent) / 100;
    const sacrifice = yearlyData.sacrifices
      .filter((s) => s.type === "pension")
      .reduce((sum, s) => sum + s.amount, 0);
    return {
      total: employee + employer + sacrifice,
      employee,
      employer,
      sacrifice,
    };
  };

  const calculateUKNetIncome = (person: IncomeState, year: string, targetAdjustedNet?: number) => {
    const originalData = getYearlyData(person, year);
    
    // If targetAdjustedNet is provided, we simulate what the income tax/NI would be
    // This is a simplified simulation for the "what if" analysis
    const data = targetAdjustedNet !== undefined 
      ? { ...originalData, baseSalary: targetAdjustedNet } // This is just for thresholds, not 100% accurate for NI
      : originalData;

    const config = TAX_YEAR_CONFIG[year] || TAX_YEAR_CONFIG[DEFAULT_YEAR];
    const totalGross = calculateTotalGross(data);
    const pensionInfo = calculateYearlyPensionContribution(data);
    const savingsInterest = calculateSavingsInterest(data);
    const salarySacrifices = data.sacrifices
      .filter((s) => s.type !== "charity")
      .reduce((sum, s) => sum + s.amount, 0);
    const giftAidRaw = data.sacrifices
      .filter((s) => s.type === "charity")
      .reduce((sum, s) => sum + s.amount, 0);
    const giftAidGrossedUp = giftAidRaw * 1.25;

    const taxableIncome = totalGross - pensionInfo.employee - salarySacrifices;
    const adjustedNetIncome = taxableIncome - giftAidGrossedUp;

    let pa = config.personalAllowance;
    if (adjustedNetIncome > 100000)
      pa = Math.max(0, pa - (adjustedNetIncome - 100000) / 2);

    const basicLimit = config.basicRateLimit + giftAidGrossedUp;
    const higherLimit = config.higherRateLimit + giftAidGrossedUp;

    let incomeTax = 0;
    if (taxableIncome > pa) {
      const basic = Math.min(taxableIncome - pa, basicLimit);
      incomeTax += basic * 0.2;
      if (taxableIncome > pa + basicLimit) {
        const higher = Math.min(
          taxableIncome - (pa + basicLimit),
          higherLimit - basicLimit,
        );
        incomeTax += higher * 0.4;
        if (taxableIncome > higherLimit + pa) {
          incomeTax += (taxableIncome - (higherLimit + pa)) * 0.45;
        }
      }
    }

    let ni = 0;
    const niable = totalGross - salarySacrifices - savingsInterest;
    if (niable > config.niPt) {
      ni +=
        Math.min(niable - config.niPt, config.niUel - config.niPt) *
        config.niRate1;
      if (niable > config.niUel) ni += (niable - config.niUel) * config.niRate2;
    }

    const curIdx = TAX_YEARS.indexOf(year);
    let carryForward = 0;
    const breakdown: Record<string, number> = {};
    for (let i = 1; i <= 3; i++) {
      const pIdx = curIdx - i;
      if (pIdx >= 0) {
        const pYear = TAX_YEARS[pIdx];
        if (pYear) {
          const pData = getYearlyData(person, pYear);
          const pConfig = TAX_YEAR_CONFIG[pYear];
          if (pConfig) {
            const unused = Math.max(
              0,
              pConfig.pensionAllowance -
                calculateYearlyPensionContribution(pData).total,
            );
            carryForward += unused;
            breakdown[pYear] = unused;
          }
        }
      }
    }

    return {
      netIncome: taxableIncome - incomeTax - ni - giftAidRaw,
      incomeTax,
      ni,
      employeePension: pensionInfo.employee,
      employerPension: pensionInfo.employer,
      adjustedNetIncome,
      currentYearContribution: pensionInfo.total,
      totalAllowanceAvailable: config.pensionAllowance + carryForward,
      pensionExceeded:
        pensionInfo.total > config.pensionAllowance + carryForward,
      carryForward,
      carryForwardBreakdown: breakdown,
      interest: savingsInterest,
    };
  };

  const p1Details = calculateUKNetIncome(person1, selectedYear);
  const p2Details = calculateUKNetIncome(person2, selectedYear);
  const THRESHOLD = 100000;

  const isEligibleForFreeChildcare = p1Details.adjustedNetIncome <= THRESHOLD && (numPeople === 1 || p2Details.adjustedNetIncome <= THRESHOLD);

  const childcareCosts = useMemo(() => {
    let totalFullYear = 0;
    let totalWithFreeHours = 0;

    childcare.children.forEach(child => {
      const weeklyFull = child.daysPerWeek * child.dailyCost;
      const weeklyFree = child.daysPerWeek * child.topUpCost;
      
      const yearlyFull = weeklyFull * 52;
      // 30 hours (approx 3 days) free for 38 weeks
      // We assume if daysPerWeek <= 3, they only pay topUp for 38 weeks.
      // If > 3, they pay (topUp for 3 days + full for remaining days) for 38 weeks.
      const dailyFreeHoursEquivalent = 3; 
      const freeDays = Math.min(child.daysPerWeek, dailyFreeHoursEquivalent);
      const paidDays = Math.max(0, child.daysPerWeek - dailyFreeHoursEquivalent);
      
      const weeklyDuringTerm = (freeDays * child.topUpCost) + (paidDays * child.dailyCost);
      const yearlyWithFree = (weeklyDuringTerm * 38) + (weeklyFull * 14);

      totalFullYear += yearlyFull;
      totalWithFreeHours += yearlyWithFree;
    });

    return {
      full: totalFullYear,
      withFree: totalWithFreeHours,
      actual: isEligibleForFreeChildcare ? totalWithFreeHours : totalFullYear,
      savings: totalFullYear - totalWithFreeHours
    };
  }, [childcare.children, isEligibleForFreeChildcare]);

  const totalTakeHome = p1Details.netIncome + (numPeople === 2 ? p2Details.netIncome : 0);
  const netAfterChildcare = totalTakeHome - childcareCosts.actual;

  // Savings Analysis Logic
  const savingsAnalysis = useMemo(() => {
    const analyzePerson = (person: IncomeState, details: any) => {
      if (details.adjustedNetIncome <= THRESHOLD) return null;
      
      const sacrificeNeeded = details.adjustedNetIncome - THRESHOLD;
      // We simulate sacrificing exactly down to 100k
      const simulatedDetails = calculateUKNetIncome(person, selectedYear, THRESHOLD);
      
      const taxSaved = (details.incomeTax + details.ni) - (simulatedDetails.incomeTax + simulatedDetails.ni);
      const takeHomeLoss = details.netIncome - simulatedDetails.netIncome;
      
      return {
        sacrificeNeeded,
        taxSaved,
        takeHomeLoss,
        simulatedDetails
      };
    };

    const p1Analysis = analyzePerson(person1, p1Details);
    const p2Analysis = numPeople === 2 ? analyzePerson(person2, p2Details) : null;

    const potentialChildcareSaving = (!isEligibleForFreeChildcare && (p1Analysis || p2Analysis)) ? childcareCosts.savings : 0;
    
    return { p1Analysis, p2Analysis, potentialChildcareSaving };
  }, [person1, person2, p1Details, p2Details, numPeople, selectedYear, isEligibleForFreeChildcare, childcareCosts.savings]);

  if (!auth.token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isRegistering ? "Create Account" : "Login"}</CardTitle>
            <CardDescription>
              Access your baby tax calculator data securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              {authError && (
                <p className="text-sm text-destructive font-medium">
                  {authError}
                </p>
              )}
              <Button type="submit" className="w-full">
                {isRegistering ? "Register" : "Login"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering
                  ? "Already have an account? Login"
                  : "Need an account? Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addChild = () => {
    setChildcare(prev => ({
      children: [
        ...prev.children,
        { id: crypto.randomUUID(), name: `Child ${prev.children.length + 1}`, daysPerWeek: 0, dailyCost: 0, topUpCost: 0 }
      ]
    }));
  };

  const updateChild = (id: string, updates: Partial<ChildcareChild>) => {
    setChildcare(prev => ({
      children: prev.children.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const removeChild = (id: string) => {
    setChildcare(prev => ({
      children: prev.children.filter(c => c.id !== id)
    }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between bg-muted/30 p-4 rounded-lg gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">{auth.user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] h-8 text-xs font-medium">
                <SelectValue placeholder="Tax Year" />
              </SelectTrigger>
              <SelectContent>
                {TAX_YEARS.map((year) => (
                  <SelectItem key={year} value={year} className="text-xs">
                    {year} {year === DEFAULT_YEAR ? "(Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {lastSaved && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant={numPeople === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setNumPeople(1)}
            >
              1 Person
            </Button>
            <Button
              variant={numPeople === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => setNumPeople(2)}
            >
              2 People
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-8">
          <div className={`grid gap-8 ${numPeople === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
            <PersonForm
              personNum={1}
              name={person1.name}
              onNameChange={(name) => updatePersonName(1, name)}
              yearlyData={getYearlyData(person1, selectedYear)}
              onUpdate={(updates) => updateYearlyData(1, selectedYear, updates)}
              details={p1Details}
              year={selectedYear}
            />
            {numPeople === 2 && (
              <PersonForm
                personNum={2}
                name={person2.name}
                onNameChange={(name) => updatePersonName(2, name)}
                yearlyData={getYearlyData(person2, selectedYear)}
                onUpdate={(updates) => updateYearlyData(2, selectedYear, updates)}
                details={p2Details}
                year={selectedYear}
              />
            )}
          </div>

          {(savingsAnalysis.p1Analysis || savingsAnalysis.p2Analysis) && (
            <Card className="border-2 border-amber-500/50 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-600" />
                  Threshold Savings Analysis
                </CardTitle>
                <CardDescription>How much could you save by sacrificing below £100k?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { analysis: savingsAnalysis.p1Analysis, name: person1.name },
                    { analysis: savingsAnalysis.p2Analysis, name: person2.name }
                  ].map((item, idx) => item.analysis && (
                    <div key={idx} className="p-4 bg-white rounded-lg border border-amber-200 space-y-3 text-sm">
                      <h4 className="font-bold border-b pb-1">{item.name}</h4>
                      <div className="flex justify-between">
                        <span>Sacrifice needed:</span>
                        <span className="font-semibold text-amber-700">£{item.analysis.sacrificeNeeded.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax/NI Saved:</span>
                        <span className="font-semibold text-green-600">+£{item.analysis.taxSaved.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Take-home Reduction:</span>
                        <span className="font-semibold text-destructive">-£{item.analysis.takeHomeLoss.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                  <h4 className="font-bold text-green-800 flex items-center gap-2">
                    <Baby className="h-4 w-4" /> Childcare Benefit
                  </h4>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Estimated Childcare Savings:</p>
                      <p className="text-xs text-muted-foreground">From 30 free hours (38 weeks/year)</p>
                    </div>
                    <span className="text-2xl font-extrabold text-green-600">
                      £{childcareCosts.savings.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">Net Yearly Gain:</span>
                      <span className="text-2xl font-black text-primary">
                        £{((savingsAnalysis.p1Analysis?.taxSaved || 0) + (savingsAnalysis.p2Analysis?.taxSaved || 0) + childcareCosts.savings - ((savingsAnalysis.p1Analysis?.takeHomeLoss || 0) + (savingsAnalysis.p2Analysis?.takeHomeLoss || 0))).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                      Combined tax savings + free childcare benefit - reduction in base take-home pay.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Childcare</CardTitle>
                <CardDescription>Manage costs per child</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={addChild}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              {childcare.children.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No children added. Click + to add.</p>
              )}
              {childcare.children.map((child) => (
                <div key={child.id} className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeChild(child.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                  <Input 
                    className="h-7 text-xs font-bold bg-transparent border-none p-0 focus-visible:ring-0" 
                    value={child.name} 
                    onChange={(e) => updateChild(child.id, { name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Days/Week</Label>
                      <Input type="number" className="h-8 text-xs" value={child.daysPerWeek || ""} onChange={(e) => updateChild(child.id, { daysPerWeek: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Daily Cost (£)</Label>
                      <Input type="number" className="h-8 text-xs" value={child.dailyCost || ""} onChange={(e) => updateChild(child.id, { dailyCost: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Top-up Cost per Day (£)</Label>
                    <Input type="number" className="h-8 text-xs" value={child.topUpCost || ""} onChange={(e) => updateChild(child.id, { topUpCost: Number(e.target.value) })} />
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Full Yearly Cost:</span>
                  <span className="line-through text-muted-foreground/60">£{childcareCosts.full.toLocaleString()}</span>
                </div>
                {isEligibleForFreeChildcare && (
                  <div className="flex justify-between text-xs text-green-600 font-medium">
                    <span>Free Childcare Benefit:</span>
                    <span>-£{childcareCosts.savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold">
                  <span>Estimated Actual Cost:</span>
                  <span className="text-destructive">£{childcareCosts.actual.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Household Net</CardTitle>
              <CardDescription>Take-home after all costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Combined Take-home:</span>
                  <span className="font-bold text-green-600">£{totalTakeHome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Childcare Costs:</span>
                  <span className="font-bold text-destructive">- £{childcareCosts.actual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="font-bold">Disposable:</span>
                  <span className="font-extrabold text-2xl text-primary">
                    £{netAfterChildcare.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Individual Threshold Analysis ({selectedYear})</CardTitle>
          <CardDescription>
            Estimated adjusted net income vs £100,000 threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummarySection personName={person1.name} details={p1Details} threshold={THRESHOLD} year={selectedYear} />
            {numPeople === 2 && <SummarySection personName={person2.name} details={p2Details} threshold={THRESHOLD} year={selectedYear} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummarySection({ personName, details, threshold, year }: { personName: string; details: any; threshold: number; year: string }) {
  const adjustedNet = details.adjustedNetIncome;
  const config = TAX_YEAR_CONFIG[year];

  return (
    <div className={`p-6 rounded-lg ${adjustedNet > threshold ? "bg-destructive/10 border border-destructive/20" : "bg-green-500/10 border border-green-500/20"}`}>
      <h3 className="font-bold text-xl mb-4 border-b pb-2">{personName} Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Adjusted Net Income:</span>
          <span className={`font-bold ${adjustedNet > threshold ? 'text-destructive' : 'text-primary'}`}>
            £{adjustedNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="flex justify-between text-xs italic text-muted-foreground">
          <span>(Target for Childcare: &lt;£100k)</span>
          {adjustedNet > threshold ? (
            <span className="text-destructive font-semibold">Over by £{(adjustedNet - threshold).toLocaleString()}</span>
          ) : (
            <span className="text-green-600 font-semibold">Under threshold</span>
          )}
        </div>
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Take-home (Est.):</span>
            <span className="font-bold text-green-600">£{details.netIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-4">
            <span>Income Tax: -£{details.incomeTax.toLocaleString()}</span>
            <span>NI: -£{details.ni.toLocaleString()}</span>
          </div>
        </div>
        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Pension Allowance Used:</span>
            <span className={`font-semibold ${details.pensionExceeded ? "text-destructive" : "text-blue-600"}`}>
              £{details.currentYearContribution.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-4">
            <span>Total Available: £{details.totalAllowanceAvailable.toLocaleString()}</span>
            {details.pensionExceeded && <span className="text-destructive font-bold">EXCEEDS</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PersonFormProps {
  personNum: 1 | 2;
  name: string;
  onNameChange: (name: string) => void;
  yearlyData: YearlyIncomeData;
  onUpdate: (updates: Partial<YearlyIncomeData>) => void;
  details: any;
  year: string;
}

function PersonForm({ name, onNameChange, yearlyData, onUpdate, year }: PersonFormProps) {
  const addBonus = () => onUpdate({ bonuses: [...yearlyData.bonuses, { id: crypto.randomUUID(), name: "New Bonus", type: "fixed", value: 0 }] });
  const updateBonus = (id: string, updates: any) => onUpdate({ bonuses: yearlyData.bonuses.map(b => b.id === id ? { ...b, ...updates } : b) });
  const removeBonus = (id: string) => onUpdate({ bonuses: yearlyData.bonuses.filter(b => b.id !== id) });

  const addSacrifice = () => onUpdate({ sacrifices: [...yearlyData.sacrifices, { id: crypto.randomUUID(), name: "New Sacrifice", amount: 0, type: "other" }] });
  const updateSacrifice = (id: string, updates: any) => onUpdate({ sacrifices: yearlyData.sacrifices.map(s => s.id === id ? { ...s, ...updates } : s) });
  const removeSacrifice = (id: string) => onUpdate({ sacrifices: yearlyData.sacrifices.filter(s => s.id !== id) });

  const addSavings = () => onUpdate({ savings: [...yearlyData.savings, { id: crypto.randomUUID(), name: "Account", balance: 0, interestRate: 0 }] });
  const updateSavings = (id: string, updates: any) => onUpdate({ savings: yearlyData.savings.map(s => s.id === id ? { ...s, ...updates } : s) });
  const removeSavings = (id: string) => onUpdate({ savings: yearlyData.savings.filter(s => s.id !== id) });

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <Input className="text-2xl font-bold border-none p-0 focus-visible:ring-0 h-auto w-full" value={name} onChange={(e) => onNameChange(e.target.value)} />
        <CardDescription>Income & Savings for {year}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="space-y-2">
          <Label>Base Salary (£)</Label>
          <Input type="number" value={yearlyData.baseSalary || ""} onChange={(e) => onUpdate({ baseSalary: Number(e.target.value) })} placeholder="e.g. 50000" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><Label>Bonuses</Label><Button variant="outline" size="sm" onClick={addBonus}><Plus className="h-4 w-4 mr-1" /> Add</Button></div>
          {yearlyData.bonuses.map(b => (
            <div key={b.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2">
                <Input className="flex-1 bg-transparent text-sm font-medium" value={b.name} onChange={(e) => updateBonus(b.id, { name: e.target.value })} placeholder="Bonus Name" />
                <Button variant="ghost" size="icon" onClick={() => removeBonus(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
              <div className="flex gap-2">
                <Input type="number" className="flex-1" value={b.value || ""} onChange={(e) => updateBonus(b.id, { value: Number(e.target.value) })} />
                <select className="h-10 w-24 rounded-md border border-input px-3 py-2 text-sm bg-background" value={b.type} onChange={(e) => updateBonus(b.id, { type: e.target.value })}>
                  <option value="fixed">£</option><option value="percentage">%</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Pension (%)</Label><Input type="number" value={yearlyData.employeePensionPercent || ""} onChange={(e) => onUpdate({ employeePensionPercent: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Employer (%)</Label><Input type="number" value={yearlyData.employerPensionPercent || ""} onChange={(e) => onUpdate({ employerPensionPercent: Number(e.target.value) })} /></div>
        </div>
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between"><Label className="text-base font-semibold">Sacrifices & Donations</Label><Button variant="outline" size="sm" onClick={addSacrifice}><Plus className="h-4 w-4 mr-1" /> Add</Button></div>
          {yearlyData.sacrifices.map(s => (
            <div key={s.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2"><Input className="flex-1 bg-transparent" value={s.name} onChange={(e) => updateSacrifice(s.id, { name: e.target.value })} /><Button variant="ghost" size="icon" onClick={() => removeSacrifice(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
              <div className="flex gap-2">
                <Input type="number" className="flex-1" value={s.amount || ""} onChange={(e) => updateSacrifice(s.id, { amount: Number(e.target.value) })} />
                <select className="h-10 w-32 rounded-md border border-input px-3 py-2 text-sm bg-background" value={s.type} onChange={(e) => updateSacrifice(s.id, { type: e.target.value })}>
                  <option value="other">General</option><option value="pension">Pension</option><option value="ev">Electric Car</option><option value="charity">Gift Aid</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between"><Label className="text-base font-semibold">Savings Accounts</Label><Button variant="outline" size="sm" onClick={addSavings}><Plus className="h-4 w-4 mr-1" /> Add</Button></div>
          {yearlyData.savings.map(s => (
            <div key={s.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="flex gap-2"><Input className="flex-1 bg-transparent" value={s.name} onChange={(e) => updateSavings(s.id, { name: e.target.value })} /><Button variant="ghost" size="icon" onClick={() => removeSavings(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
              <div className="flex gap-2">
                <Input type="number" className="flex-1" placeholder="Balance" value={s.balance || ""} onChange={(e) => updateSavings(s.id, { balance: Number(e.target.value) })} />
                <Input type="number" className="w-24" placeholder="Rate %" value={s.interestRate || ""} onChange={(e) => updateSavings(s.id, { interestRate: Number(e.target.value) })} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
