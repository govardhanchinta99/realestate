import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

interface MortgageCalculatorProps {
  price: number;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ price }) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);

  const downPaymentAmount = Math.round((price * downPaymentPercent) / 100);
  const loanAmount = Math.max(0, price - downPaymentAmount);

  // Monthly interest rate
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  // Monthly Principal & Interest calculation formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
  const monthlyPI =
    monthlyRate > 0 && numberOfPayments > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : loanAmount / (numberOfPayments || 1);

  // Estimated Property Tax (approx 1.1% per year) & Home Insurance (~$120/mo)
  const monthlyTax = Math.round((price * 0.011) / 12);
  const monthlyInsurance = Math.round((price * 0.0035) / 12);
  const totalMonthly = Math.round(monthlyPI + monthlyTax + monthlyInsurance);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Calculator className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground text-sm">Monthly Payment Estimate</h4>
          <p className="text-xs text-muted-foreground">Estimate your mortgage, taxes & insurance</p>
        </div>
      </div>

      {/* Main Number */}
      <div className="flex items-baseline gap-1.5 mb-5 pb-4 border-b border-border/60">
        <span className="font-display text-3xl font-bold text-primary">
          ${totalMonthly.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground font-medium">/month</span>
      </div>

      {/* Visual Stacked Progress Bar */}
      <div className="mb-5">
        <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(monthlyPI / totalMonthly) * 100}%` }}
            className="bg-primary h-full transition-all"
            title="Principal & Interest"
          />
          <div
            style={{ width: `${(monthlyTax / totalMonthly) * 100}%` }}
            className="bg-accent h-full transition-all"
            title="Property Taxes"
          />
          <div
            style={{ width: `${(monthlyInsurance / totalMonthly) * 100}%` }}
            className="bg-emerald-400 h-full transition-all"
            title="Home Insurance"
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" /> Principal & Interest ($
            {Math.round(monthlyPI).toLocaleString()})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent" /> Tax (${monthlyTax})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Ins (${monthlyInsurance})
          </span>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="space-y-3 text-xs">
        {/* Down Payment */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium text-foreground">Down Payment</label>
            <span className="text-muted-foreground">
              {downPaymentPercent}% (${downPaymentAmount.toLocaleString()})
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-medium text-foreground">Interest Rate</label>
            <span className="text-muted-foreground">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Loan Term */}
        <div>
          <label className="font-medium text-foreground mb-1 block">Loan Term</label>
          <div className="grid grid-cols-2 gap-2">
            {[15, 30].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setLoanTermYears(term)}
                className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                  loanTermYears === term
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                }`}
              >
                {term} Years Fixed
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
