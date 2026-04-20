import { createContext, useMemo, useState } from "react";

const InterviewContext = createContext(null);

const InterviewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  const value = useMemo(
    () => ({ loading, setLoading, report, setReport, reports, setReports, error, setError }),
    [loading, report, reports, error],
  );

  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>;
};

export { InterviewContext, InterviewProvider };
