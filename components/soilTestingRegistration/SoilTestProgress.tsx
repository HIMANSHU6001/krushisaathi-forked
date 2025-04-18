"use client";
import UserContext from "@/context/UserContext";
import { UserModel } from "@/models/User";
import { Yard, YardModel } from "@/models/Yard";
import { ChevronRight, Check, Leaf } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SoilTestLoader } from "../common/SkeletonLoader";
import { useRouter } from "next/navigation";
import YardContext from "@/context/YardContext";

interface SoilTestProgressProps {
  yardId: string;
}

const SoilTestProgress: React.FC<SoilTestProgressProps> = ({ yardId }) => {
  const userContext = useContext(UserContext);
  const yardContext = useContext(YardContext);

  const router = useRouter();

  //@ts-expect-error - Unreachable code error
  const { user, getUserData } = userContext;
  //@ts-expect-error - Unreachable code error
  const { getYards } = yardContext;
  const [yards, setYards] = useState<YardModel[]>([]);
  const [yard, setYard] = useState<Yard | undefined>();
  const [activeSample, setActiveSample] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          getUserData();
        }

        if (user) {
          const yardData = await getYards(
            (user as UserModel).id,
            (user as UserModel).role
          );

          if (yardData && yardData.length > 0) {
            setYards(yardData);

            const givenYard = yardData.find(
              (y: YardModel) => y.yardId === yardId
            );

            if (givenYard) {
              setYard(givenYard);
            } else {
              setYard(yardData[0]);
              toast.success("Selected first available yard");
            }
          } else {
            toast.error("No yards found");
          }
        }
      } catch (error) {
        console.error("Error fetching yard data:", error);
        toast.error("Failed to fetch yard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, yardId, getUserData, getYards]);

  // if (!userContext) {
  //   console.error("User context is not provided");
  //   return <div>Error: User context is not provided.</div>;
  // }

  // if (!yardContext) {
  //   console.error("Yard context is not provided");
  //   return <div>Error: Yard context is not provided.</div>;
  // }

  const getProgress = () => {
    const totalSamples = yard?.samples.length || 1;
    const completedSamples = yard?.samples.filter(
      (sample) => sample.status === "completed"
    ).length;
    return completedSamples ? (completedSamples / totalSamples) * 100 : 0;
  };

  const getSampleProgress = () => {
    const status = yard?.samples[activeSample - 1].status;
    if (status === "pending") return 1;
    else if (status === "in-progress") return 2;
    else if (status === "completed") return 3;
    return 0;
  };

  const handleNextSample = () => {
    if (yard && activeSample < yard.samples.length) {
      setActiveSample(activeSample + 1);
    } else {
      setActiveSample(1);
    }
  };

  if (isLoading && !yard) {
    return (
      <div>
        <SoilTestLoader />
      </div>
    );
  }

  return (
    <div className="soil-test-container">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-16 soil-fade-in">
          <div className="soil-header-badge mb-3">
            <Leaf size={14} className="opacity-90" />
            <span>Soil Health Analysis</span>
          </div>
          <h1 className="soil-title">Your Soil Testing Dashboard</h1>
          <p className="soil-subtitle">
            Monitor your soil analysis progress and access comprehensive test
            results to optimize your crop yield
          </p>
        </div>

        <div className="mb-16 soil-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="soil-section-title">In Progress Tests</h2>
            <div className="relative">
              <select
                className="soil-select"
                value={yard?.yardId}
                onChange={(e) => {
                  const newYard = yards?.find(
                    (yard) => yard.yardId === e.target.value
                  );
                  setYard(newYard);
                  setActiveSample(1);
                }}
              >
                <option value="" disabled>
                  Select a yard
                </option>
                {yards?.map((yard) => (
                  <option key={yard.yardId} value={yard.yardId}>
                    {yard.yardName} ({yard.samples.length} samples)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="soil-card">
            <div className="soil-card-header">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm text-gray-500 font-medium">
                      Sample {activeSample} of {yard?.samples.length}
                    </span>
                    <div className="soil-sample-div"></div>
                    <span className="text-xl font-bold text-gray-900">
                      {yard?.yardName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-600">
                      {yard?.samples[activeSample - 1]?.sampleName}
                    </h3>
                    <div className="soil-sample-badge">
                      {yard?.samples[activeSample - 1]?.sampleId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10 relative soil-progress-step">
                <div className="soil-progress-track"></div>
                <div
                  className="soil-progress-track-completed "
                  style={{
                    width:
                      getSampleProgress() >= 3
                        ? "100%"
                        : getSampleProgress() >= 2
                        ? "66%"
                        : getSampleProgress() >= 1
                        ? "33%"
                        : "0%",
                  }}
                ></div>

                <div className="flex justify-between ">
                  <div className="w-1/4 flex flex-col items-center text-center">
                    <div
                      className={`soil-step-circle ${
                        getSampleProgress() >= 1
                          ? "soil-step-circle-completed"
                          : "soil-step-circle-pending"
                      }`}
                    >
                      {getSampleProgress() >= 1 ? (
                        <Check size={18} />
                      ) : (
                        <span>1</span>
                      )}
                    </div>
                    <div
                      className={`soil-step-label ${
                        getSampleProgress() >= 1
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      Sample Received
                    </div>
                    <div className="soil-step-status">
                      {getSampleProgress() >= 1 ? "Completed" : "Pending"}
                    </div>
                  </div>

                  <div className="w-1/4 flex flex-col items-center text-center">
                    <div
                      className={`soil-step-circle ${
                        getSampleProgress() >= 2
                          ? "soil-step-circle-completed"
                          : getSampleProgress() === 1
                          ? "soil-step-circle-active"
                          : "soil-step-circle-pending"
                      }`}
                    >
                      {getSampleProgress() >= 2 ? (
                        <Check size={18} />
                      ) : (
                        <span>2</span>
                      )}
                    </div>
                    <div
                      className={`soil-step-label ${
                        getSampleProgress() >= 2
                          ? "text-gray-900"
                          : getSampleProgress() === 1
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      Analysis
                    </div>
                    <div className="soil-step-status">
                      {getSampleProgress() >= 2
                        ? "Completed"
                        : getSampleProgress() === 1
                        ? "In Progress"
                        : "Pending"}
                    </div>
                  </div>

                  <div className="w-1/4 flex flex-col items-center text-center">
                    <div
                      className={`soil-step-circle ${
                        getSampleProgress() >= 3
                          ? "soil-step-circle-completed"
                          : getSampleProgress() === 2
                          ? "soil-step-circle-active"
                          : "soil-step-circle-pending"
                      }`}
                    >
                      {getSampleProgress() >= 3 ? (
                        <Check size={18} />
                      ) : (
                        <span>3</span>
                      )}
                    </div>
                    <div
                      className={`soil-step-label ${
                        getSampleProgress() >= 3
                          ? "text-gray-900"
                          : getSampleProgress() === 2
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      Processing
                    </div>
                    <div className="soil-step-status">
                      {getSampleProgress() >= 3
                        ? "Completed"
                        : getSampleProgress() === 2
                        ? "In Progress"
                        : "Pending"}
                    </div>
                  </div>

                  <div className="w-1/4 flex flex-col items-center text-center">
                    <div
                      className={`soil-step-circle ${
                        getSampleProgress() >= 4
                          ? "soil-step-circle-completed"
                          : getSampleProgress() === 3
                          ? "soil-step-circle-active"
                          : "soil-step-circle-pending"
                      }`}
                    >
                      {getSampleProgress() >= 4 ? (
                        <Check size={18} />
                      ) : (
                        <span>4</span>
                      )}
                    </div>
                    <div
                      className={`soil-step-label ${
                        getSampleProgress() >= 4
                          ? "text-gray-900"
                          : getSampleProgress() === 3
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      Result Ready
                    </div>
                    <div className="soil-step-status">
                      {getSampleProgress() >= 4
                        ? "Completed"
                        : getSampleProgress() === 3
                        ? "Processing"
                        : "Pending"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="soil-card-content">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-700">
                    Processing:{" "}
                    <span className="text-green-700 font-semibold">
                      {getProgress().toFixed(0)}%
                    </span>
                  </div>
                  <div className="soil-progress-bar-container">
                    <div
                      className="soil-progress-bar"
                      style={{ width: `${getProgress()}%` }}
                    ></div>
                  </div>
                  <button
                    className="soil-button soil-button-primary"
                    onClick={handleNextSample}
                  >
                    Next Sample
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="soil-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="soil-section-title">All Yards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yards &&
              yards?.length > 0 &&
              yards?.map((yard) => (
                <div key={yard.yardId} className="soil-report-card">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-gray-900">
                      {yard.yardName}
                    </h3>
                    <div className="soil-sample-count">
                      {yard.samples.length} samples
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    {yard.samples.map((sample, index) => (
                      <div key={index} className="soil-report-item">
                        <div>
                          <div className="text-gray-900 font-medium">
                            {sample.sampleName}
                          </div>
                          <div className="text-gray-500 text-xs font-mono">
                            {sample.sampleId}
                          </div>
                        </div>
                        {sample.status === "completed" ? (
                          <button
                            onClick={() => {
                              if (!sample.sampleId || !yard.yardId) return;
                              router.push(
                                `/view-report?sampleId=${sample.sampleId}&&yardId=${yard.yardId}`
                              );
                            }}
                            className="flex items-center gap-3"
                          >
                            <p className="soil-view-report">view report</p>
                            <ChevronRight size={16} className="soil-chevron" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-3">
                            <p className="soil-view-report">Pending</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <a
                    href="https://agriappai.streamlit.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block soil-recommendations-button"
                  >
                    View Smart Recommendations
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilTestProgress;
