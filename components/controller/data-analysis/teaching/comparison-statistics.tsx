import { ComparisonStatistics } from "@/types/teaching.types";

interface StatisticsProps {
  statistics: ComparisonStatistics;
}

export const Statistics = ({ statistics }: StatisticsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {statistics.addedLines}
        </div>
        <div className="text-sm text-gray-500">Added Lines</div>
      </div>
      <div className="border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {statistics.removedLines}
        </div>
        <div className="text-sm text-gray-500">Removed Lines</div>
      </div>
      <div className="border rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          {statistics.similarityPercentage}%
        </div>
        <div className="text-sm text-gray-500">Similarity</div>
      </div>
    </div>
  );
};
