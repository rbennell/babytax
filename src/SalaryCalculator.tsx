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
import {
  Plus,
  Trash2,
  LogOut,
  Calculator,
  Calendar,
  CheckCircle2,
  Baby,
  Info,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

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
  birthDate: string;
  daysPerWeek: number;
  hoursPerDay: number;
  dailyCost: number;
  topUpCost: number;
  benefitStartDate: string;
  benefitEndDate: string;
  useTaxFreeChildcare: boolean;
  totalAttendingHours?: number;
  totalFreeHours?: number;
}

interface ChildcareData {
  children: ChildcareChild[];
}

const TAX_YEARS = [
  "2022/23",
  "2023/24",
  "2024/25",
  "2025/26",
  "2026/27",
  "2027/28",
  "2028/29",
  "2029/30",
  "2030/31",
];
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
  "2027/28": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2028/29": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2029/30": {
    personalAllowance: 12570,
    basicRateLimit: 37700,
    higherRateLimit: 125140,
    niPt: 12570,
    niUel: 50270,
    niRate1: 0.08,
    niRate2: 0.02,
    pensionAllowance: 60000,
  },
  "2030/31": {
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

interface PersonFormProps {
  personNum: 1 | 2;
  name: string;
  onNameChange: (name: string) => void;
  yearlyData: YearlyIncomeData;
  onUpdate: (updates: Partial<YearlyIncomeData>) => void;
  details: any;
  year: string;
}

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
      console.log("Loaded data from DB:", data);
      if (data.id) {
        setNumPeople(data.numPeople);
        if (data.childcareData) {
          console.log("Loading childcare data:", data.childcareData);
          setChildcare(data.childcareData);
        } else {
          console.log("No childcare data in response");
        }
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
      console.log("Saving childcare data:", childcare);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Save failed with status:", res.status, errorText);
        throw new Error("Failed to save");
      }
      const savedData = await res.json();
      console.log("Saved data response:", savedData);
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!auth.token) return;
    const timer = setTimeout(() => {
      saveData();
    }, 2000);
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

  const calculateUKNetIncome = (
    person: IncomeState,
    year: string,
    targetAdjustedNet?: number,
  ) => {
    const originalData = getYearlyData(person, year);
    const data =
      targetAdjustedNet !== undefined
        ? { ...originalData, baseSalary: targetAdjustedNet }
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

    // Calculate baseline take-home (0 pension, 0 sacrifice)
    const baselineTaxableIncome = totalGross;
    let baselinePA = config.personalAllowance;
    if (baselineTaxableIncome > 100000)
      baselinePA = Math.max(
        0,
        baselinePA - (baselineTaxableIncome - 100000) / 2,
      );

    let baselineIncomeTax = 0;
    if (baselineTaxableIncome > baselinePA) {
      const basic = Math.min(
        baselineTaxableIncome - baselinePA,
        config.basicRateLimit,
      );
      baselineIncomeTax += basic * 0.2;
      if (baselineTaxableIncome > baselinePA + config.basicRateLimit) {
        const higher = Math.min(
          baselineTaxableIncome - (baselinePA + config.basicRateLimit),
          config.higherRateLimit - config.basicRateLimit,
        );
        baselineIncomeTax += higher * 0.4;
        if (baselineTaxableIncome > config.higherRateLimit + baselinePA) {
          baselineIncomeTax +=
            (baselineTaxableIncome - (config.higherRateLimit + baselinePA)) *
            0.45;
        }
      }
    }

    let baselineNI = 0;
    const baselineNIable = totalGross - savingsInterest;
    if (baselineNIable > config.niPt) {
      baselineNI +=
        Math.min(baselineNIable - config.niPt, config.niUel - config.niPt) *
        config.niRate1;
      if (baselineNIable > config.niUel)
        baselineNI += (baselineNIable - config.niUel) * config.niRate2;
    }

    const baselineTakeHome =
      baselineTaxableIncome - baselineIncomeTax - baselineNI;

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
      grossSalary: totalGross,
      baselineTakeHome,
    };
  };

  const p1Details = calculateUKNetIncome(person1, selectedYear);
  const p2Details = calculateUKNetIncome(person2, selectedYear);
  const THRESHOLD = 100000;

  // Eligibility for free childcare is based on PREVIOUS tax year's income
  const prevYearIdx = TAX_YEARS.indexOf(selectedYear) - 1;
  const previousYear = prevYearIdx >= 0 ? TAX_YEARS[prevYearIdx] : null;

  let isEligibleForFreeChildcare = false;
  if (previousYear) {
    const p1PrevDetails = calculateUKNetIncome(person1, previousYear);
    const p2PrevDetails = calculateUKNetIncome(person2, previousYear);
    isEligibleForFreeChildcare =
      p1PrevDetails.adjustedNetIncome <= THRESHOLD &&
      (numPeople === 1 || p2PrevDetails.adjustedNetIncome <= THRESHOLD);
  }

  const getTaxYearDates = (year: string) => {
    const parts = year.split("/");
    const startYear = parts[0] ? parseInt(parts[0]) : 2025;
    return {
      start: new Date(`${startYear}-04-06`),
      end: new Date(`${startYear + 1}-04-05`),
    };
  };

  const calculateChildcareForEligibility = (
    isEligible: boolean,
    yearStr: string,
  ) => {
    let totalFullYear = 0;
    let totalWithBenefits = 0;
    let totalTaxFreeSavings = 0;

    const taxYear = getTaxYearDates(yearStr);

    childcare.children.forEach((child) => {
      const hoursPerDay = child.hoursPerDay || 10;
      const hourlyRate = child.dailyCost / hoursPerDay;
      const weeklyHours = child.daysPerWeek * hoursPerDay;

      // Calculate child's age during the tax year to determine benefit eligibility
      // UK Free Childcare Rules:
      // 1. Working Parents (income <£100k): 30 hours for 9 months to 4 years old
      // 2. Universal: 15 hours for ALL 3-4 year olds (no income restriction)
      let totalFreeHoursAvailable = 0;
      if (child.birthDate) {
        const birthDate = new Date(child.birthDate);
        const taxYearStart = taxYear.start;
        const taxYearEnd = taxYear.end;

        // Calculate age in months at end of tax year
        const ageMonthsAtEnd =
          (taxYearEnd.getTime() - birthDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30.44);
        const ageYearsAtEnd = ageMonthsAtEnd / 12;

        // Determine which benefit tier applies
        if (isEligible && ageMonthsAtEnd >= 9 && ageYearsAtEnd < 4) {
          // Working Parents scheme: 30 hours for 9 months to 4 years (income <£100k)
          totalFreeHoursAvailable = 1140; // 30 hours * 38 weeks
        } else if (ageYearsAtEnd >= 3 && ageYearsAtEnd < 4) {
          // Universal scheme: 15 hours for ALL 3-4 year olds (no income check)
          totalFreeHoursAvailable = 570; // 15 hours * 38 weeks
        }
        // If under 9 months or 4+ years, totalFreeHoursAvailable remains 0
      }

      // Define the period the child is attending childcare
      const attendanceStart = child.benefitStartDate
        ? new Date(child.benefitStartDate)
        : taxYear.start;
      const attendanceEnd = child.benefitEndDate
        ? new Date(child.benefitEndDate)
        : taxYear.end;

      // Overlap of attendance with the current tax year
      const overlapStart = new Date(
        Math.max(taxYear.start.getTime(), attendanceStart.getTime()),
      );
      const overlapEnd = new Date(
        Math.min(taxYear.end.getTime(), attendanceEnd.getTime()),
      );

      const overlapDays = Math.max(
        0,
        Math.ceil(
          (overlapEnd.getTime() - overlapStart.getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1,
      );
      const overlapWeeks = overlapDays / 7;
      const overlapYearFraction = overlapWeeks / 52;

      // Total hours the child attends during the overlap with this tax year
      const totalAttendingHours = weeklyHours * overlapWeeks;

      // Costs for the overlap period (no benefits applied yet)
      const costDuringOverlap = totalAttendingHours * hourlyRate;

      // Benefit Calculation (age-based hours)
      const freeHoursInOverlap = totalFreeHoursAvailable * overlapYearFraction;
      const coveredHours = Math.min(totalAttendingHours, freeHoursInOverlap);
      const remainingHoursInOverlap = totalAttendingHours - coveredHours;

      const costWith30Hours =
        coveredHours * child.topUpCost + remainingHoursInOverlap * hourlyRate;

      // Tax-Free Childcare (TFC)
      let finalCostForChild = costWith30Hours;
      let tfcSaving = 0;

      if (child.useTaxFreeChildcare && isEligible) {
        tfcSaving = Math.min(
          finalCostForChild * 0.2,
          2000 * overlapYearFraction,
        );
        finalCostForChild -= tfcSaving;
      }

      totalFullYear += costDuringOverlap;
      totalWithBenefits += finalCostForChild;
      totalTaxFreeSavings += tfcSaving;

      // Store individual child hours for the return object if needed, but for now we aggregate
      child.totalAttendingHours = totalAttendingHours;
      child.totalFreeHours = coveredHours;
    });

    return {
      full: totalFullYear,
      actual: totalWithBenefits,
      savings: totalFullYear - totalWithBenefits,
      taxFreeSavings: totalTaxFreeSavings,
      totalAttendingHours: childcare.children.reduce(
        (sum, c: any) => sum + (c.totalAttendingHours || 0),
        0,
      ),
      totalFreeHours: childcare.children.reduce(
        (sum, c: any) => sum + (c.totalFreeHours || 0),
        0,
      ),
    };
  };

  const childcareCosts = useMemo(
    () =>
      calculateChildcareForEligibility(
        isEligibleForFreeChildcare,
        selectedYear,
      ),
    [childcare.children, isEligibleForFreeChildcare, selectedYear],
  );

  const totalTakeHome =
    p1Details.netIncome + (numPeople === 2 ? p2Details.netIncome : 0);
  const netAfterChildcare = totalTakeHome - childcareCosts.actual;

  const savingsAnalysis = useMemo(() => {
    const analyzePerson = (person: IncomeState, details: any) => {
      if (details.adjustedNetIncome <= THRESHOLD) return null;
      const sacrificeNeeded = details.adjustedNetIncome - THRESHOLD;
      const simulatedDetails = calculateUKNetIncome(
        person,
        selectedYear,
        THRESHOLD,
      );
      const taxSaved =
        details.incomeTax +
        details.ni -
        (simulatedDetails.incomeTax + simulatedDetails.ni);
      const originalTakeHome = details.netIncome;
      const newTakeHome = simulatedDetails.netIncome;
      const takeHomeLoss = originalTakeHome - newTakeHome;
      return {
        sacrificeNeeded,
        taxSaved,
        takeHomeLoss,
        originalTakeHome,
        newTakeHome,
      };
    };

    const p1Analysis = analyzePerson(person1, p1Details);
    const p2Analysis =
      numPeople === 2 ? analyzePerson(person2, p2Details) : null;

    // If not currently eligible, childcare savings only apply in NEXT year after sacrifice
    // If already eligible, savings apply in current year
    const potentialChildcareSaving = isEligibleForFreeChildcare
      ? calculateChildcareForEligibility(true, selectedYear).savings
      : 0;

    // Look ahead to next year if sacrifice is applied
    const nextYearIdx = TAX_YEARS.indexOf(selectedYear) + 1;
    let nextYearSaving = 0;
    let nextYearLabel = "";
    if (nextYearIdx >= 0 && nextYearIdx < TAX_YEARS.length) {
      const label = TAX_YEARS[nextYearIdx];
      if (label) {
        nextYearLabel = label;
        const nextYearCosts = calculateChildcareForEligibility(
          true,
          nextYearLabel,
        );
        nextYearSaving = nextYearCosts.savings;
      }
    }

    return {
      p1Analysis,
      p2Analysis,
      potentialChildcareSaving,
      nextYearSaving,
      nextYearLabel,
    };
  }, [
    person1,
    person2,
    p1Details,
    p2Details,
    numPeople,
    selectedYear,
    isEligibleForFreeChildcare,
    childcare.children,
  ]);

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
    const parts = selectedYear.split("/");
    const startYear = parts[0] ? parseInt(parts[0]) : 2025;
    setChildcare((prev) => ({
      children: [
        ...prev.children,
        {
          id: crypto.randomUUID(),
          name: `Child ${prev.children.length + 1}`,
          birthDate: "",
          daysPerWeek: 0,
          hoursPerDay: 10,
          dailyCost: 0,
          topUpCost: 0,
          benefitStartDate: `${startYear}-04-06`,
          benefitEndDate: `${startYear + 1}-04-05`,
          useTaxFreeChildcare: true,
        },
      ],
    }));
  };

  const updateChild = (id: string, updates: Partial<ChildcareChild>) => {
    setChildcare((prev) => ({
      children: prev.children.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    }));
  };

  const removeChild = (id: string) => {
    setChildcare((prev) => ({
      children: prev.children.filter((c) => c.id !== id),
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
              <span>
                Saved{" "}
                {lastSaved.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
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
          <div
            className={`grid gap-8 ${numPeople === 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
          >
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
                onUpdate={(updates) =>
                  updateYearlyData(2, selectedYear, updates)
                }
                details={p2Details}
                year={selectedYear}
              />
            )}
          </div>

          {(savingsAnalysis.p1Analysis || savingsAnalysis.p2Analysis) && (
            <Card className="border-2 border-amber-500/50 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-600" /> Threshold Savings
                  Analysis
                </CardTitle>
                <CardDescription>
                  How much could you save by sacrificing below £100k?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      analysis: savingsAnalysis.p1Analysis,
                      name: person1.name,
                    },
                    {
                      analysis: savingsAnalysis.p2Analysis,
                      name: person2.name,
                    },
                  ].map(
                    (item, idx) =>
                      item.analysis && (
                        <div
                          key={idx}
                          className="p-4 bg-white rounded-lg border border-amber-200 space-y-3 text-sm"
                        >
                          <h4 className="font-bold border-b pb-1">
                            {item.name}
                          </h4>
                          <div className="flex justify-between">
                            <span>Sacrifice needed:</span>
                            <span className="font-semibold text-amber-700">
                              £{item.analysis.sacrificeNeeded.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax/NI Saved:</span>
                            <span className="font-semibold text-green-600">
                              +£{item.analysis.taxSaved.toLocaleString()}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-amber-100 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Current take-home:
                              </span>
                              <span className="font-medium">
                                £
                                {item.analysis.originalTakeHome.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                New take-home:
                              </span>
                              <span className="font-medium">
                                £{item.analysis.newTakeHome.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Net change:</span>
                              <span className="text-destructive">
                                -£{item.analysis.takeHomeLoss.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                  )}
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
                  <h4 className="font-bold text-green-800 flex items-center gap-2">
                    <Baby className="h-4 w-4" /> Potential Comprehensive Benefit
                  </h4>
                  <div className="space-y-4">
                    {isEligibleForFreeChildcare ? (
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-amber-800">
                            In Current Year ({selectedYear}):
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Already eligible - savings apply now
                          </p>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          £
                          {savingsAnalysis.potentialChildcareSaving.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-amber-800">
                            In Current Year ({selectedYear}):
                          </p>
                          <p className="text-xs text-muted-foreground">
                            No childcare savings (eligibility starts next year)
                          </p>
                        </div>
                        <span className="text-xl font-bold text-muted-foreground">
                          £0
                        </span>
                      </div>
                    )}

                    {savingsAnalysis.nextYearLabel && (
                      <div className="flex justify-between items-center pt-2 border-t border-green-100">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-amber-800">
                            In Next Year ({savingsAnalysis.nextYearLabel}):
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isEligibleForFreeChildcare
                              ? "Estimated benefit if eligibility maintained"
                              : "First year of childcare savings after sacrifice"}
                          </p>
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                          £{savingsAnalysis.nextYearSaving.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-primary">
                        {isEligibleForFreeChildcare
                          ? "Total Potential Gain (Current Year):"
                          : "Net Impact (Current Year):"}
                      </span>
                      <span className="text-2xl font-black text-primary">
                        £
                        {(
                          (savingsAnalysis.p1Analysis?.taxSaved || 0) +
                          (savingsAnalysis.p2Analysis?.taxSaved || 0) +
                          savingsAnalysis.potentialChildcareSaving -
                          ((savingsAnalysis.p1Analysis?.takeHomeLoss || 0) +
                            (savingsAnalysis.p2Analysis?.takeHomeLoss || 0))
                        ).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                      {isEligibleForFreeChildcare
                        ? `Tax savings + Childcare benefits (${selectedYear}) - Take-home reduction.`
                        : `Tax savings (${selectedYear}) - Take-home reduction. Childcare savings begin next year.`}
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
                <p className="text-sm text-muted-foreground italic text-center py-4">
                  No children added.
                </p>
              )}
              {childcare.children.map((child: any) => (
                <div
                  key={child.id}
                  className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border relative group"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100"
                    onClick={() => removeChild(child.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                  <Input
                    className="h-7 text-xs font-bold bg-transparent border-none p-0 focus-visible:ring-0"
                    value={child.name}
                    onChange={(e) =>
                      updateChild(child.id, { name: e.target.value })
                    }
                  />
                  <div className="space-y-1">
                    <Label className="text-[10px]">Birth Date</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs"
                      value={child.birthDate}
                      onChange={(e) =>
                        updateChild(child.id, {
                          birthDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Active Start</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={child.benefitStartDate}
                        onChange={(e) =>
                          updateChild(child.id, {
                            benefitStartDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Active End</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={child.benefitEndDate}
                        onChange={(e) =>
                          updateChild(child.id, {
                            benefitEndDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Days/Wk</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={child.daysPerWeek || ""}
                        onChange={(e) =>
                          updateChild(child.id, {
                            daysPerWeek: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Hrs/Day</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={child.hoursPerDay || ""}
                        onChange={(e) =>
                          updateChild(child.id, {
                            hoursPerDay: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Daily £</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={child.dailyCost || ""}
                        onChange={(e) =>
                          updateChild(child.id, {
                            dailyCost: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 mr-4">
                      <Label className="text-[10px]">Top-up £/Day</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={child.topUpCost || ""}
                        onChange={(e) =>
                          updateChild(child.id, {
                            topUpCost: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Label className="text-[10px]">Tax-Free</Label>
                      <input
                        type="checkbox"
                        checked={child.useTaxFreeChildcare}
                        onChange={(e) =>
                          updateChild(child.id, {
                            useTaxFreeChildcare: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                  </div>
                  {child.totalAttendingHours > 0 && (
                    <div className="pt-2 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground italic">
                      <span>
                        Total: {Math.round(child.totalAttendingHours)} hrs
                      </span>
                      {isEligibleForFreeChildcare && (
                        <span>
                          Free: {Math.round(child.totalFreeHours)} hrs
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t space-y-3">
                <div className="bg-muted/30 p-3 rounded-md space-y-2">
                  <h4 className="text-xs font-semibold text-primary mb-2">
                    Calculation Breakdown:
                  </h4>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Hours Attending:
                      </span>
                      <span className="font-medium">
                        {Math.round(childcareCosts.totalAttendingHours || 0)}{" "}
                        hrs
                      </span>
                    </div>

                    {isEligibleForFreeChildcare &&
                      childcareCosts.totalFreeHours > 0 && (
                        <>
                          <div className="flex justify-between text-green-700">
                            <span>Free Hours (30hrs scheme):</span>
                            <span className="font-medium">
                              -{Math.round(childcareCosts.totalFreeHours || 0)}{" "}
                              hrs
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-border/50 pt-1">
                            <span className="text-muted-foreground">
                              Paid Hours:
                            </span>
                            <span className="font-medium">
                              {Math.round(
                                (childcareCosts.totalAttendingHours || 0) -
                                  (childcareCosts.totalFreeHours || 0),
                              )}{" "}
                              hrs
                            </span>
                          </div>
                        </>
                      )}
                  </div>

                  <div className="pt-2 border-t border-border/50 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Full Cost (no benefits):
                      </span>
                      <span className="font-medium">
                        £{childcareCosts.full.toLocaleString()}
                      </span>
                    </div>

                    {isEligibleForFreeChildcare && (
                      <>
                        <div className="flex justify-between text-green-700">
                          <span>Saving from Free Hours:</span>
                          <span className="font-medium">
                            -£
                            {(
                              childcareCosts.full -
                              childcareCosts.actual -
                              (childcareCosts.taxFreeSavings || 0)
                            ).toLocaleString()}
                          </span>
                        </div>

                        {childcareCosts.taxFreeSavings > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <span>Tax-Free Childcare (20%):</span>
                            <span className="font-medium">
                              -£{childcareCosts.taxFreeSavings.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-between border-t border-border/50 pt-1 font-bold text-sm">
                      <span>Final Cost:</span>
                      <span className="text-destructive">
                        £{childcareCosts.actual.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isEligibleForFreeChildcare && (
                    <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground italic">
                      <div className="flex justify-between">
                        <span>Total Savings:</span>
                        <span className="text-green-700 font-semibold">
                          £{childcareCosts.savings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
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
                  <span className="text-muted-foreground text-sm">
                    Combined Take-home:
                  </span>
                  <span className="font-bold text-green-600">
                    £
                    {totalTakeHome.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Childcare Costs:
                  </span>
                  <span className="font-bold text-destructive">
                    - £
                    {childcareCosts.actual.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="font-bold">Disposable:</span>
                  <span className="font-extrabold text-2xl text-primary">
                    £
                    {netAfterChildcare.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>3-Year Financial Overview</CardTitle>
          <CardDescription>
            Compare previous, current, and next year projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-semibold">Metric</th>
                  {(() => {
                    const currentIdx = TAX_YEARS.indexOf(selectedYear);
                    const years = [
                      currentIdx > 0 ? TAX_YEARS[currentIdx - 1] : null,
                      selectedYear,
                      currentIdx < TAX_YEARS.length - 1
                        ? TAX_YEARS[currentIdx + 1]
                        : null,
                    ];
                    return years.map((year, idx) =>
                      year ? (
                        <th
                          key={year}
                          className={`text-right py-3 px-2 font-semibold ${idx === 1 ? "bg-primary/10" : ""}`}
                        >
                          {year}
                        </th>
                      ) : null,
                    );
                  })()}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const currentIdx = TAX_YEARS.indexOf(selectedYear);
                  const years = [
                    currentIdx > 0 ? TAX_YEARS[currentIdx - 1] : null,
                    selectedYear,
                    currentIdx < TAX_YEARS.length - 1
                      ? TAX_YEARS[currentIdx + 1]
                      : null,
                  ];

                  const yearData = years.map((year) => {
                    if (!year) return null;
                    const p1 = calculateUKNetIncome(person1, year);
                    const p2 = calculateUKNetIncome(person2, year);
                    const totalGross =
                      p1.grossSalary + (numPeople === 2 ? p2.grossSalary : 0);
                    const totalTakeHome =
                      p1.netIncome + (numPeople === 2 ? p2.netIncome : 0);
                    const totalPension =
                      p1.currentYearContribution +
                      (numPeople === 2 ? p2.currentYearContribution : 0);

                    // Check eligibility based on previous year
                    const prevYearIdx = TAX_YEARS.indexOf(year) - 1;
                    const prevYear =
                      prevYearIdx >= 0 ? TAX_YEARS[prevYearIdx] : null;
                    let isEligible = false;
                    if (prevYear) {
                      const p1Prev = calculateUKNetIncome(person1, prevYear);
                      const p2Prev = calculateUKNetIncome(person2, prevYear);
                      isEligible =
                        p1Prev.adjustedNetIncome <= THRESHOLD &&
                        (numPeople === 1 ||
                          p2Prev.adjustedNetIncome <= THRESHOLD);
                    }

                    const childcareCost = calculateChildcareForEligibility(
                      isEligible,
                      year,
                    );
                    const disposable = totalTakeHome - childcareCost.actual;

                    return {
                      totalGross,
                      totalTakeHome,
                      childcareCost: childcareCost.actual,
                      totalPension,
                      disposable,
                    };
                  });

                  return (
                    <>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">
                          Total Gross Income
                        </td>
                        {yearData.map((data, idx) =>
                          data ? (
                            <td
                              key={idx}
                              className={`text-right py-3 px-2 ${idx === 1 ? "bg-primary/10 font-semibold" : ""}`}
                            >
                              £
                              {data.totalGross.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          ) : null,
                        )}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">
                          Total Pension Contributions
                        </td>
                        {yearData.map((data, idx) =>
                          data ? (
                            <td
                              key={idx}
                              className={`text-right py-3 px-2 text-blue-600 ${idx === 1 ? "bg-primary/10 font-semibold" : ""}`}
                            >
                              £
                              {data.totalPension.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          ) : null,
                        )}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">
                          Combined Take-home
                        </td>
                        {yearData.map((data, idx) =>
                          data ? (
                            <td
                              key={idx}
                              className={`text-right py-3 px-2 text-green-600 ${idx === 1 ? "bg-primary/10 font-semibold" : ""}`}
                            >
                              £
                              {data.totalTakeHome.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          ) : null,
                        )}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">
                          Childcare Costs
                        </td>
                        {yearData.map((data, idx) =>
                          data ? (
                            <td
                              key={idx}
                              className={`text-right py-3 px-2 text-destructive ${idx === 1 ? "bg-primary/10 font-semibold" : ""}`}
                            >
                              £
                              {data.childcareCost.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          ) : null,
                        )}
                      </tr>
                      <tr className="border-b-2 border-primary/20 hover:bg-muted/50">
                        <td className="py-3 px-2 font-bold">
                          Disposable Income
                        </td>
                        {yearData.map((data, idx) =>
                          data ? (
                            <td
                              key={idx}
                              className={`text-right py-3 px-2 font-bold text-primary text-lg ${idx === 1 ? "bg-primary/10" : ""}`}
                            >
                              £
                              {data.disposable.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          ) : null,
                        )}
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Individual Threshold Analysis ({selectedYear})</CardTitle>
          <CardDescription>
            Estimated adjusted net income vs £100,000 threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummarySection
              personName={person1.name}
              details={p1Details}
              threshold={THRESHOLD}
              year={selectedYear}
            />
            {numPeople === 2 && (
              <SummarySection
                personName={person2.name}
                details={p2Details}
                threshold={THRESHOLD}
                year={selectedYear}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PersonForm({
  personNum,
  name,
  onNameChange,
  yearlyData,
  onUpdate,
  details,
  year,
}: PersonFormProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Input
          className="text-lg font-bold h-8 w-full bg-transparent border-none p-0 mb-1 focus-visible:ring-0"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Base Salary</Label>
              <Input
                type="number"
                className="h-9"
                value={yearlyData.baseSalary || ""}
                onChange={(e) =>
                  onUpdate({ baseSalary: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Car Allowance</Label>
              <Input
                type="number"
                className="h-9"
                value={yearlyData.carAllowance || ""}
                onChange={(e) =>
                  onUpdate({ carAllowance: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Employee Pension %</Label>
              <Input
                type="number"
                className="h-9"
                value={yearlyData.employeePensionPercent || ""}
                onChange={(e) =>
                  onUpdate({ employeePensionPercent: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Employer Pension %</Label>
              <Input
                type="number"
                className="h-9"
                value={yearlyData.employerPensionPercent || ""}
                onChange={(e) =>
                  onUpdate({ employerPensionPercent: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
        <ListSection
          title="Bonuses"
          items={yearlyData.bonuses}
          onAdd={() =>
            onUpdate({
              bonuses: [
                ...yearlyData.bonuses,
                {
                  id: crypto.randomUUID(),
                  name: "Bonus",
                  type: "fixed",
                  value: 0,
                },
              ],
            })
          }
          onRemove={(id: string) =>
            onUpdate({
              bonuses: yearlyData.bonuses.filter((b: any) => b.id !== id),
            })
          }
          onUpdateItem={(id: string, upd: any) =>
            onUpdate({
              bonuses: yearlyData.bonuses.map((b: any) =>
                b.id === id ? { ...b, ...upd } : b,
              ),
            })
          }
          renderItem={(item: any, updateItem: any) => (
            <div className="flex gap-2 w-full">
              <Input
                className="h-8 flex-1 text-xs"
                value={item.name}
                onChange={(e) => updateItem({ name: e.target.value })}
              />
              <Select
                value={item.type}
                onValueChange={(v: any) => updateItem({ type: v })}
              >
                <SelectTrigger className="h-8 w-20 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">£</SelectItem>
                  <SelectItem value="percentage">%</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                className="h-8 w-20 text-xs"
                value={item.value || ""}
                onChange={(e) => updateItem({ value: Number(e.target.value) })}
              />
            </div>
          )}
        />
        <ListSection
          title="Savings"
          items={yearlyData.savings}
          onAdd={() =>
            onUpdate({
              savings: [
                ...yearlyData.savings,
                {
                  id: crypto.randomUUID(),
                  name: "Savings",
                  balance: 0,
                  interestRate: 0,
                },
              ],
            })
          }
          onRemove={(id: string) =>
            onUpdate({
              savings: yearlyData.savings.filter((s: any) => s.id !== id),
            })
          }
          onUpdateItem={(id: string, upd: any) =>
            onUpdate({
              savings: yearlyData.savings.map((s: any) =>
                s.id === id ? { ...s, ...upd } : s,
              ),
            })
          }
          renderItem={(item: any, updateItem: any) => (
            <div className="flex gap-2 w-full">
              <Input
                className="h-8 flex-1 text-xs"
                value={item.name}
                onChange={(e) => updateItem({ name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Balance"
                className="h-8 w-24 text-xs"
                value={item.balance || ""}
                onChange={(e) =>
                  updateItem({ balance: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                placeholder="%"
                className="h-8 w-16 text-xs"
                value={item.interestRate || ""}
                onChange={(e) =>
                  updateItem({ interestRate: Number(e.target.value) })
                }
              />
            </div>
          )}
        />
        <ListSection
          title="Sacrifices"
          items={yearlyData.sacrifices}
          onAdd={() =>
            onUpdate({
              sacrifices: [
                ...yearlyData.sacrifices,
                {
                  id: crypto.randomUUID(),
                  name: "Sacrifice",
                  amount: 0,
                  type: "other",
                },
              ],
            })
          }
          onRemove={(id: string) =>
            onUpdate({
              sacrifices: yearlyData.sacrifices.filter((s: any) => s.id !== id),
            })
          }
          onUpdateItem={(id: string, upd: any) =>
            onUpdate({
              sacrifices: yearlyData.sacrifices.map((s: any) =>
                s.id === id ? { ...s, ...upd } : s,
              ),
            })
          }
          renderItem={(item: any, updateItem: any) => (
            <div className="flex gap-2 w-full">
              <Input
                className="h-8 flex-1 text-xs"
                value={item.name}
                onChange={(e) => updateItem({ name: e.target.value })}
              />
              <Select
                value={item.type}
                onValueChange={(v: any) => updateItem({ type: v })}
              >
                <SelectTrigger className="h-8 w-24 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pension">Pension</SelectItem>
                  <SelectItem value="ev">EV</SelectItem>
                  <SelectItem value="charity">Charity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                className="h-8 w-20 text-xs"
                value={item.amount || ""}
                onChange={(e) => updateItem({ amount: Number(e.target.value) })}
              />
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}

function ListSection({
  title,
  items,
  onAdd,
  onRemove,
  onUpdateItem,
  renderItem,
}: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </Label>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAdd}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-2 group">
            {renderItem(item, (upd: any) => onUpdateItem(item.id, upd))}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummarySection({ personName, details, threshold, year }: any) {
  const adjustedNet = details.adjustedNetIncome;
  const takeHomeDifference = details.netIncome - details.baselineTakeHome;

  return (
    <div
      className={`p-6 rounded-lg ${adjustedNet > threshold ? "bg-destructive/10 border border-destructive/20" : "bg-green-500/10 border border-green-500/20"}`}
    >
      <h3 className="font-bold text-xl mb-4 border-b pb-2">
        {personName} Summary
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Gross Salary:</span>
          <span className="font-bold text-primary">
            £
            {details.grossSalary.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Adjusted Net Income:</span>
          <span
            className={`font-bold ${adjustedNet > threshold ? "text-destructive" : "text-primary"}`}
          >
            £
            {adjustedNet.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <div className="flex justify-between text-xs italic text-muted-foreground">
          <span>(Target for Childcare: &lt;£100k)</span>
          {adjustedNet > threshold ? (
            <span className="text-destructive font-semibold">
              Over by £{(adjustedNet - threshold).toLocaleString()}
            </span>
          ) : (
            <span className="text-green-600 font-semibold text-xs flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Eligible for Benefits
            </span>
          )}
        </div>
        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">
              Take-home (Est.):
            </span>
            <span className="font-bold text-green-600">
              £
              {details.netIncome.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-4">
            <span>Income Tax: -£{details.incomeTax.toLocaleString()}</span>
            <span>NI: -£{details.ni.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs mt-2 pt-2 border-t border-muted">
            <span className="text-muted-foreground">
              vs. Baseline (0 pension, 0 sacrifice):
            </span>
            <span
              className={`font-semibold ${takeHomeDifference < 0 ? "text-destructive" : "text-green-600"}`}
            >
              {takeHomeDifference < 0 ? "-" : "+"}£
              {Math.abs(takeHomeDifference).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
        <div className="pt-2 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              Pension Allowance Used:
            </span>
            <span
              className={`font-semibold ${details.pensionExceeded ? "text-destructive" : "text-blue-600"}`}
            >
              £{details.currentYearContribution.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground pl-4">
            <span>
              Total Available: £
              {details.totalAllowanceAvailable.toLocaleString()}
            </span>
            {details.pensionExceeded && (
              <span className="text-destructive font-bold">EXCEEDS</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
