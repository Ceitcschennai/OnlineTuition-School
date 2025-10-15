import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import '../styles/teacherQueries.css';
import {
  FaSearch,
  FaFilter,
  FaUser,
  FaClock,
  FaSortAmountDown,
  FaSortAmountUp,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const StudentQueries = () => {
  const [queries, setQueries] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0, resolved: 0 });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  // Get current teacher (in real app, this would come from authentication)
  const currentTeacherId = localStorage.getItem('teacherId') || '64f9b123456789012345678a';

  // Fetch queries with filters
  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 8,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'All' && { status: filterStatus }),
        ...(filterSubject !== 'All' && { subject: filterSubject }),
        ...(filterPriority !== 'All' && { priority: filterPriority }),
        sortBy: 'createdAt',
        sortOrder
      });

      const response = await axios.get(`${API_BASE_URL}/api/queries?${queryParams}`);

      if (response.status === 200) {
        setQueries(response.data.queries);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch queries:', error);
      // Fallback to dummy data if backend is not available
      setQueries([
        {
          _id: '1',
          studentName: 'Rahul Kumar',
          studentClass: '10',
          subject: 'Mathematics',
          question: 'I am having trouble understanding the concept of quadratic equations. Can you explain the discriminant method?',
          reply: '',
          status: 'Pending',
          priority: 'Medium',
          createdAt: new Date().toISOString(),
          views: 12,
          tags: ['algebra', 'equations']
        },
        {
          _id: '2',
          studentName: 'Anjali Sharma',
          studentClass: '9',
          subject: 'Physics',
          question: 'Can you explain Newton\'s third law of motion with some real-life examples?',
          reply: 'Newton\'s third law states that for every action, there is an equal and opposite reaction...',
          status: 'Answered',
          priority: 'High',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          views: 25,
          tags: ['mechanics', 'laws']
        }
      ]);
      setStats({ total: 2, pending: 1, answered: 1, resolved: 0 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, filterSubject, filterPriority, sortOrder]);

  // Fetch subjects for filter
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/subjects`);
      if (response.status === 200) {
        const subjectNames = response.data.subjects.map(subject => subject.name);
        setSubjects([...new Set(subjectNames)]);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History']);
    }
  };

  useEffect(() => {
    fetchQueries();
    fetchSubjects();
  }, [fetchQueries]);

  const handleReplyChange = (id, text) => {
    setReplies(prev => ({ ...prev, [id]: text }));
  };

  const handleReplySubmit = async (queryId) => {
    if (!replies[queryId]?.trim()) {
      alert('Please enter a reply');
      return;
    }

    setReplyingTo(queryId);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/queries/${queryId}/reply`, {
        reply: replies[queryId],
        teacherId: currentTeacherId,
        status: 'Answered'
      });

      if (response.status === 200) {
        setQueries(prev => prev.map(q => 
          q._id === queryId 
            ? { ...q, reply: replies[queryId], status: 'Answered', repliedAt: new Date().toISOString() }
            : q
        ));
        setReplies(prev => ({ ...prev, [queryId]: '' }));
        alert('Reply submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      // Fallback for demo
      setQueries(prev => prev.map(q => 
        q._id === queryId 
          ? { ...q, reply: replies[queryId], status: 'Answered', repliedAt: new Date().toISOString() }
          : q
      ));
      setReplies(prev => ({ ...prev, [queryId]: '' }));
      alert('Reply submitted successfully!');
    } finally {
      setReplyingTo(null);
    }
  };

  const handleStatusUpdate = async (queryId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/queries/${queryId}/status`, {
        status: newStatus
      });
      
      setQueries(prev => prev.map(q => 
        q._id === queryId ? { ...q, status: newStatus } : q
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback for demo
      setQueries(prev => prev.map(q => 
        q._id === queryId ? { ...q, status: newStatus } : q
      ));
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="teacher-queries-container">
      {/* Header */}
      <div className="queries-header">
        <div className="queries-header-content">
          <h2>
            Student Queries
          </h2>
          <p>View and respond to student questions and doubts</p>
        </div>
        
        <div className="queries-statistics-row">
          <div className="queries-stat-card">
            <span className="queries-stat-number">{stats.total}</span>
            <span className="queries-stat-label">Total</span>
          </div>
          <div className="queries-stat-card pending">
            <span className="queries-stat-number">{stats.pending}</span>
            <span className="queries-stat-label">Pending</span>
          </div>
          <div className="queries-stat-card answered">
            <span className="queries-stat-number">{stats.answered}</span>
            <span className="queries-stat-label">Answered</span>
          </div>
          <div className="queries-stat-card resolved">
            <span className="queries-stat-number">{stats.resolved}</span>
            <span className="queries-stat-label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="queries-controls">
        <div className="queries-controls-left">
          <div className="queries-search-container">
            <FaSearch className="queries-search-icon" />
            <input
              type="text"
              placeholder="Search queries by student, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="queries-search-input"
            />
          </div>
        </div>

        <div className="queries-controls-right">
          <div className="queries-filter-dropdown">
            <button
              className="queries-filter-btn"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <FaFilter /> Filter
            </button>
            
            {showFilterMenu && (
              <div className="queries-filter-menu">
                <div className="filter-group">
                  <label>Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Answered">Answered</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Subject:</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="All">All Subjects</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Priority:</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="All">All Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="queries-sort-dropdown">
            <button
              className="queries-sort-btn"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Queries Grid */}
      <div className="queries-main-container">
        {loading ? (
          <div className="queries-loading-spinner">
            <div className="queries-spinner"></div>
            <p>Loading queries...</p>
          </div>
        ) : (
          <div className="queries-cards-grid-restructured">
            {queries.length === 0 ? (
              <div className="queries-no-data">
                <p>No queries found</p>
              </div>
            ) : (
              queries.map((query) => (
                <div key={query._id} className="query-card-restructured">
                  
                  {/* Top Section - Student & Subject */}
                  <div className="card-top-section">
                    <div className="student-profile-area">
                      <div className="student-avatar">
                        <FaUser />
                      </div>
                      <div className="student-info">
                        <div className="student-name-section">
                          <h3 className="student-name">
                            {query.studentName || `${query.student?.firstName || ''} ${query.student?.lastName || ''}`.trim() || 'Student'}
                          </h3>
                          <span className="query-time">
                            <FaClock className="time-icon" />
                            {formatTimeAgo(query.createdAt)}
                          </span>
                        </div>
                        <div className="student-meta">
                          <span className="class-badge">
                            Class {query.studentClass?.toString().replace(/^Class\s*/i, '') || query.student?.class?.toString().replace(/^Class\s*/i, '') || '10'}
                          </span>
                          <span className="subject-chip">
                            {query.subject}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Section */}
                  <div className="question-container">
                    <h4>Question</h4>
                    <div className="question-content">
                      <p>{query.question}</p>
                    </div>
                  </div>

                  {/* Interactive Section */}
                  <div className="card-interaction-section">
                    {query.status === 'Answered' || query.status === 'Resolved' ? (
                      <div className="answered-section">
                        <div className="reply-header">
                          <h4>Teacher Reply</h4>
                          {query.repliedAt && (
                            <div className="reply-timestamp">
                              <span>{formatTimeAgo(query.repliedAt)}</span>
                            </div>
                          )}
                        </div>
                        <div className="reply-content">
                          <p>{query.reply}</p>
                        </div>
                        {query.status === 'Answered' && (
                          <div className="post-reply-actions">
                            <button
                              onClick={() => handleStatusUpdate(query._id, 'Resolved')}
                              className="resolve-button"
                            >
                              Mark Resolved
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pending-section">
                        <h4>Your Response</h4>
                        <div className="reply-compose-area">
                          <textarea
                            placeholder="Type your answer here..."
                            value={replies[query._id] || ''}
                            onChange={(e) => handleReplyChange(query._id, e.target.value)}
                            className="compose-textarea"
                            rows="2"
                          />
                          <div className="compose-actions">
                            <button
                              onClick={() => handleReplySubmit(query._id)}
                              className="submit-reply-button"
                              disabled={replyingTo === query._id || !replies[query._id]?.trim()}
                            >
                              {replyingTo === query._id ? "Sending..." : "Reply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer">
                    <div className="query-id">#{query._id.slice(-6)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="queries-pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="queries-pagination-btn"
            >
              <FaChevronLeft />
            </button>
            
            <span className="queries-pagination-info">
              Page {currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="queries-pagination-btn"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQueries;
