import UploadIcon from "../icons/NetworkStats/UploadIcon";
import DownloadIcon from "../icons/NetworkStats/DownloadIcon";
import RefreshIcon from "../icons/NetworkStats/RefreshIcon";
import RefreshCheck from "../icons/NetworkStats/RefreshCheck";
import { getNetworkStats } from "@videosdk.live/react-sdk";
import WifiOff from "../icons/NetworkStats/WifiOff";
import { useEffect, useState } from "react";

const NetworkStats = () => {
  const [error, setError] = useState("no-error-loading");
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [downloadSpeed, setDownloadSpeed] = useState(null);

  useEffect(() => {
    getNetworkStatistics();
  }, []);

  const getNetworkStatistics = async () => {
    setError("no-error-loading");
    try {
      const options = { timeoutDuration: 45000 }; // 45 seconds timeout
      const networkStatsData = await getNetworkStats(options);
      console.log("Raw network stats:", networkStatsData);

      if (networkStatsData) {
        setError("no-error");
        setDownloadSpeed(networkStatsData.downloadSpeed ?? 0);
        setUploadSpeed(networkStatsData.uploadSpeed ?? 0);
        // Use optional chaining to safely get transferSize
        const transferSize = networkStatsData?.transferSize ?? 0;
        console.log("Transfer size:", transferSize);
      } else {
        console.log("No network stats received.");
        setError("timeout");
      }
    } catch (ex) {
      console.log("Error in networkStats:", ex);
      if (ex.message?.includes("no Network")) {
        setError("no-wifi");
      } else if (ex.message?.includes("timeout")) {
        setError("timeout");
      } else {
        setError("unknown error");
      }
    }
  };

  const handleOnClick = () => {
    getNetworkStatistics();
  };

  return (
    <>
      <div className="flex flex-row auto-cols-max border border-[#3F4346] divide-x divide-[#3F4346] rounded-md bg-black opacity-80 h-9 ">
        {error === "no-error-loading" && (
          <div className="group inline-flex items-center gap-3 text-xs text-customGray-250 ml-3 " style={{color: "white"}}>
            Checking network speeds
            <RefreshCheck />
          </div>
        )}

        {error === "no-error" && (
          <>
            <div className="group inline-flex items-center gap-2 text-xs text-customGray-250 basis-1/2 w-32" style={{color: "white"}}>
              <DownloadIcon />
              {downloadSpeed} MBPS
            </div>
            <div className="group inline-flex items-center gap-2 text-xs text-customGray-250 basis-1/2 w-32" style={{color: "white"}}>
              <UploadIcon />
              {uploadSpeed} MBPS
            </div>
            <div className="basis-1/6 flex items-center justify-center" onClick={handleOnClick} style={{color: "white"}}>
              <RefreshIcon />
            </div>
          </>
        )}

        {error === "no-wifi" && (
          <>
            <div className="group inline-flex items-center gap-3 text-xs text-red-250 p-2 " style={{color: "white"}}>
              <WifiOff />
              You're offline! Check your connection
            </div>
          </>
        )}

        {error === "timeout" && (
          <>
            <div className="group inline-flex items-center gap-3 text-xs text-red-250 p-2 " style={{color: "white"}}>
              Something went wrong! Couldn't load data
            </div>
            <div className="flex items-center justify-center p-2" onClick={handleOnClick} style={{color: "white"}}>
              <RefreshIcon />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default NetworkStats;