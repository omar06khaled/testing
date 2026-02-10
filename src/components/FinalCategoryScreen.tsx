interface FinalCategoryScreenProps {
  category: string;
  onContinue: () => void;
}

export const FinalCategoryScreen = ({ category, onContinue }: FinalCategoryScreenProps) => {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-brand-800/80 p-8 text-center shadow-lg">
      <h2 className="text-2xl font-semibold text-slate-200">Final Round Category</h2>
      <p className="mt-4 text-4xl font-bold text-accent-500">{category}</p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 rounded-lg bg-accent-500 px-6 py-3 text-lg font-semibold text-brand-900"
      >
        Continue to Wagers
      </button>
    </div>
  );
};
