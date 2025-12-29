export const getUncertaintyLevel = (confidence) => {
  if (confidence >= 85) return "Low";
  if (confidence >= 70) return "Medium";
  return "High";
};

export const bumpModelVersion = (version) => {
  const [major, minor] = version.replace("v", "").split(".").map(Number);
  const nextMinor = (Number.isNaN(minor) ? 0 : minor) + 1;
  return `v${major}.${nextMinor}`;
};
