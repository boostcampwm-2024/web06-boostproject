export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PLANNED':
      return 'bg-gray-200 text-gray-800';
    case 'CURRENT':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};
