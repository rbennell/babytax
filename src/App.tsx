import { SalaryCalculator } from "./SalaryCalculator";
import "./index.css";

export function App() {
  return (
    <div className="container mx-auto p-4 md:p-8 relative z-10">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          UK Childcare Salary Sacrifice Calculator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Calculate your adjusted net income to see if you qualify for free
          childcare thresholds.
        </p>
      </header>

      <main>
        <SalaryCalculator />
      </main>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Childcare Tax Tools</p>
      </footer>
    </div>
  );
}

export default App;
