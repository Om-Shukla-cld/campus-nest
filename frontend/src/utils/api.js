const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  getToken() {
    return localStorage.getItem('campusnest_token');
  }

  setToken(token) {
    localStorage.setItem('campusnest_token', token);
  }

  clearToken() {
    localStorage.removeItem('campusnest_token');
    localStorage.removeItem('campusnest_user');
  }

  async request(path, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
      if (res.status === 401) {
        this.clearToken();
        window.location.reload();
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'API Error');
      return data;
    } catch (err) {
      // If backend not available, return null for graceful degradation
      console.warn(`API call failed: ${path}`, err.message);
      return null;
    }
  }

  get(path) { return this.request(path, { method: 'GET' }); }
  post(path, body) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); }
  patch(path, body) { return this.request(path, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete(path) { return this.request(path, { method: 'DELETE' }); }

  // Auth
  sendOtp(phone) { return this.post('/auth/send-otp', { phone }); }
  registerStudent(data) { return this.post('/auth/student/register', data); }
  loginStudent(identifier, otp_code) { return this.post('/auth/student/login', { identifier, otp_code }); }
  registerOwner(data) { return this.post('/auth/owner/register', data); }
  loginOwner(phone, otp_code) { return this.post('/auth/owner/login', { phone, otp_code }); }

  // Profile
  saveProfile(data) { return this.post('/profile', data); }
  getMyProfile() { return this.get('/profile/me'); }

  // Properties
  getProperties(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return this.get(`/properties?${params}`);
  }
  getProperty(id) { return this.get(`/properties/${id}`); }
  createProperty(data) { return this.post('/properties', data); }
  compareProperties(ids) { return this.post('/properties/compare', ids); }

  // Reviews
  submitReview(data) { return this.post('/reviews', data); }
  getReviews(propertyId) { return this.get(`/properties/${propertyId}/reviews`); }

  // Owner
  getOwnerProperties() { return this.get('/owner/properties'); }
  updateTenancy(id, data) { return this.patch(`/tenancies/${id}`, data); }

  // Services
  getServices(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/services?${params}`);
  }

  // Community
  getCommunityGroups() { return this.get('/community/groups'); }
  getGroupPosts(groupId) { return this.get(`/community/groups/${groupId}/posts`); }
  createPost(data) { return this.post('/community/posts', data); }
  likePost(postId) { return this.post(`/community/posts/${postId}/like`); }
  addComment(postId, content) { return this.post(`/community/posts/${postId}/comments`, { content }); }

  // Commute
  getCommuteGroups() { return this.get('/commute/groups'); }
  joinCommuteGroup(id) { return this.post(`/commute/groups/${id}/join`); }

  // Rent Trends
  getRentTrends(area, propertyType) {
    const params = new URLSearchParams({ ...(area && { area }), ...(propertyType && { property_type: propertyType }) });
    return this.get(`/rent-trends?${params}`);
  }

  // Notifications
  getNotifications() { return this.get('/notifications'); }
  markRead(id) { return this.patch(`/notifications/${id}/read`); }

  // Moderator
  getPendingOwners() { return this.get('/moderator/pending-owners'); }
  getPendingProperties() { return this.get('/moderator/pending-properties'); }
  moderateOwner(id, action, reason) { return this.patch(`/moderator/owners/${id}`, { action, reason }); }
  moderateProperty(id, action, reason) { return this.patch(`/moderator/properties/${id}`, { action, reason }); }
  getReviewsForMod() { return this.get('/moderator/reviews'); }
  moderateReview(id, action) { return this.patch(`/moderator/reviews/${id}`, { action }); }
}

export const api = new ApiClient();
export default api;
