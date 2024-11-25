export const getSprintStatus = (startDate: string, endDate: string) => {
  const now = new Date().toISOString().split('T')[0];
  if (now < startDate) return 'PLANNED';
  if (now > endDate) return 'COMPLETED';
  return 'CURRENT';
};
