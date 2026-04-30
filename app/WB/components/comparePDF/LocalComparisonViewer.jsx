import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { DownloadCloud } from 'lucide-react';

const LocalComparisonViewer = ({
  file,
  data,
  masterDataRows,
  matchStatus,
  processFileSelection
}) => {
  return (
    <motion.div
      key="console"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full overflow-hidden"
    >
      <div className="flex-shrink-0 p-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
        <h2 className="text-xs font-black text-[#464775] uppercase">
          Local Comparison Viewer
        </h2>

        {matchStatus === 'mismatch' && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-[9px] font-bold text-gray-400 uppercase">
                Cloud Master
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#237B4B] rounded-full" />
              <span className="text-[9px] font-bold text-[#237B4B] uppercase">
                New Change
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-auto">
        {!file ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <DownloadCloud size={40} />
            <p className="text-[11px] font-bold mt-2">Drop CSV for preview</p>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => processFileSelection(e.target.files[0])}
              className="hidden"
              id="main-up"
            />

            <label
              htmlFor="main-up"
              className="mt-4 px-4 py-2 border rounded text-[10px] font-bold cursor-pointer uppercase"
            >
              Load File
            </label>
          </div>
        ) : (
          <table className="w-full text-left text-[10px]">
            <thead className="bg-[#FAF9F8] sticky top-0 z-20">
              <tr>
                {data[0]?.map((header, index) => (
                  <th
                    key={index}
                    className="p-3 font-black border-b border-[#EDEBE9] uppercase whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-[#F3F2F1] hover:bg-gray-50 transition-colors bg-white"
                >
                  {row.map((cell, cellIndex) => {
                    const masterCell = masterDataRows[rowIndex]
                      ? masterDataRows[rowIndex][cellIndex]
                      : null;

                    const isCellDiff =
                      masterCell !== null && cell !== masterCell;

                    return (
                      <td
                        key={cellIndex}
                        className={`p-3 border-r border-[#F3F2F1] ${
                          isCellDiff ? 'bg-orange-50/40' : ''
                        }`}
                      >
                        {isCellDiff ? (
                          <div className="flex flex-col">
                            <span className="text-red-500 line-through font-medium opacity-60">
                              {masterCell || '(null)'}
                            </span>

                            <div className="flex items-center gap-1 text-[#237B4B] font-bold">
                              <FiArrowRight size={10} />
                              <span>{cell}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600">{cell}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};

export default LocalComparisonViewer;