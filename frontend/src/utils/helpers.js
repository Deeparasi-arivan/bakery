/**
 * Format number as Indian Rupee (INR)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Format Date to readable string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString('en-IN', options);
};

/**
 * Resolve image URL (handle relative uploads or absolute URLs)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Server uploads
  return `http://localhost:5000${imagePath}`;
};

/**
 * Get status badge CSS class
 */
export const getOrderStatusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-warning text-dark';
    case 'Confirmed':
      return 'bg-info text-dark';
    case 'Preparing':
      return 'bg-primary';
    case 'Ready':
      return 'bg-secondary';
    case 'Out for Delivery':
      return 'bg-info';
    case 'Delivered':
      return 'bg-success';
    case 'Cancelled':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};
