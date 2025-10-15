import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import TeacherAssignmentModal from '../components/TeacherAssignmentModal';
import '../styles/manageTeachers.css';
import { 
  FaChalkboardTeacher, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaToggleOn, 
  FaToggleOff,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaUserCheck,
  FaUsers,
  FaGraduationCap,
  FaMobileAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
  FaBookOpen,
  FaUserGraduate,
  FaStar,
  FaUserTie
} from 'react-icons/fa';

const ManageTeachers = () => {
  // State management
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'edit', 'view', 'add'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, assigned: 0, active: 0, inactive: 0 });
  
  // Assignment modal state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState('assign'); // 'assign' or 'edit'

  const filterRef = useRef(null);

  // Form data
  const [formData, setFormData] = useState({
    salutation: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    timezone: '',
    password: '',
    preferredSubjects: '',
    experience: '',
    qualification: '',
    notes: ''
  });

  // Filter options similar to students page
  const filterOptions = [
    { value: 'All', label: 'All Teachers' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved Only' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Fetch teachers from backend
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 8,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'All' && { status: filterStatus })
      });

      const response = await axios.get(`${API_BASE_URL}/api/admin/teachers?${queryParams}`);

      if (response.status === 200) {
        setTeachers(response.data.teachers);
        setPagination(response.data.pagination);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      salutation: 'Mr.',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      timezone: '',
      password: '',
      preferredSubjects: '',
      experience: '',
      qualification: '',
      notes: ''
    });
  };

  // Open modal
  const openModal = (type, teacher = null) => {
    setModalType(type);
    setSelectedTeacher(teacher);
    
    if (teacher && type === 'edit') {
      setFormData({
        salutation: teacher.salutation || 'Mr.',
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        email: teacher.email || '',
        mobile: teacher.mobile || '',
        timezone: teacher.timezone || '',
        password: '', // Don't prefill password
        preferredSubjects: teacher.preferredSubjects ? teacher.preferredSubjects.join(', ') : '',
        experience: teacher.experience || '',
        qualification: teacher.qualification || '',
        notes: teacher.notes || ''
      });
    } else if (type === 'add') {
      resetForm();
    }
    
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedTeacher(null);
    resetForm();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...formData,
        preferredSubjects: formData.preferredSubjects 
          ? formData.preferredSubjects.split(',').map(s => s.trim()).filter(s => s)
          : []
      };

      const isEdit = modalType === 'edit';
      const url = isEdit 
        ? `${API_BASE_URL}/api/admin/teachers/${selectedTeacher._id}`
        : `${API_BASE_URL}/api/admin/teachers`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        data: dataToSend
      });

      if (response.status === 200) {
        alert(response.data.message);
        closeModal();
        fetchTeachers();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  // Handle approval
  const handleApproval = async (id, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/admin/teachers/${id}/status`, { status });
      
      if (status === true) {
        // Find the approved teacher
        const approvedTeacher = teachers.find(t => t._id === id);
        if (approvedTeacher) {
          setSelectedTeacher(approvedTeacher);
          setAssignmentMode('assign');
          setShowAssignmentModal(true);
        }
      } else {
        fetchTeachers();
      }
      
      alert(response.data.message);
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Something went wrong while updating teacher status.');
    }
  };

  // Handle assignment completion
  const handleAssignmentComplete = (updatedTeacher) => {
    console.log('Assignment completed, updated teacher:', updatedTeacher);
    setShowAssignmentModal(false);
    setSelectedTeacher(null);
    fetchTeachers(); // Refresh the teacher list
  };

  // Handle edit assignment
  const handleEditAssignment = (teacher) => {
    setSelectedTeacher(teacher);
    setAssignmentMode('edit');
    setShowAssignmentModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/teachers/${id}`);
      alert('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Failed to delete teacher');
    }
  };

  // Toggle active status
  const toggleStatus = async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/admin/teachers/${id}/toggle-status`);
      alert(response.data.message);
      fetchTeachers();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update teacher status');
    }
  };

  // Get status badge class
  const getStatusClass = (teacher) => {
    if (!teacher.isApproved) return 'pending';
    if (teacher.isApproved && (teacher.classAssigned || teacher.classesAssigned)) return 'assigned';
    return 'approved';
  };

  // Get status text
  const getStatusText = (teacher) => {
    if (!teacher.isApproved) return 'Pending';
    if (teacher.isApproved && (teacher.classAssigned || teacher.classesAssigned)) return 'Assigned';
    return 'Approved';
  };

  return (
    <div className="teacher-management-container">
      {/* Header */}
      <div className="teacher-management-header">
        <div className="teacher-header-content">
          <h2>
            <FaChalkboardTeacher className="teacher-header-icon" />
            Manage Teachers
          </h2>
          <p>Manage teacher registrations, approvals, and assignments</p>
        </div>
        
        <div className="teacher-statistics-row">
          <div className="teacher-stat-card">
            <span className="teacher-stat-number">{stats.total}</span>
            <span className="teacher-stat-label">Total</span>
          </div>
          <div className="teacher-stat-card">
            <span className="teacher-stat-number">{stats.pending}</span>
            <span className="teacher-stat-label">Pending</span>
          </div>
          <div className="teacher-stat-card">
            <span className="teacher-stat-number">{stats.approved}</span>
            <span className="teacher-stat-label">Approved</span>
          </div>
          <div className="teacher-stat-card">
            <span className="teacher-stat-number">{stats.assigned}</span>
            <span className="teacher-stat-label">Assigned</span>
          </div>
          <div className="teacher-stat-card">
            <span className="teacher-stat-number">{stats.active}</span>
            <span className="teacher-stat-label">Active</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="teachers-controls">
        <div className="teachers-controls-left">
          <div className="teachers-search-container">
            <FaSearch className="teachers-search-icon" />
            <input
              type="text"
              placeholder="Search teachers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="teachers-search-input"
            />
          </div>
        </div>

        <div className="teachers-controls-right">
          <div className="teachers-filter-dropdown" ref={filterRef}>
            <button
              className="teachers-filter-btn"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <FaFilter />
              Filter
            </button>
            
            {showFilterMenu && (
              <div className="teachers-filter-menu">
                {filterOptions.map(option => (
                  <div
                    key={option.value}
                    className={`teachers-filter-option ${filterStatus === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setFilterStatus(option.value);
                      setShowFilterMenu(false);
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => openModal('add')}
            className="add-teacher-btn"
          >
            <FaPlus className="teacher-btn-icon" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="teachers-main-container">
        {loading ? (
          <div className="teachers-loading-spinner">
            <div className="teachers-spinner"></div>
            <p>Loading teachers...</p>
          </div>
        ) : (
          <div className="teachers-cards-grid">
            {teachers.length === 0 ? (
              <div className="teachers-no-data">
                <FaChalkboardTeacher className="teachers-no-data-icon" />
                <p>No teachers found</p>
              </div>
            ) : (
              teachers.map((teacher, index) => {
                console.log(`Teacher ${teacher.firstName} ${teacher.lastName}:`, {
                  classAssigned: teacher.classAssigned,
                  classesAssigned: teacher.classesAssigned,
                  subjects: teacher.subjects
                });
                
                return (
                <div 
                  key={teacher._id} 
                  className="concise-teacher-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Concise Header */}
                  <div className="concise-card-header">
                    <div className="teacher-avatar">
                      <FaGraduationCap />
                      <div className={`status-indicator ${teacher.isActive ? 'active' : 'inactive'}`}></div>
                    </div>
                    
                    <div className="teacher-info">
                      <div className="teacher-name-section">
                        <h3 className="teacher-name">
                          {`${teacher.salutation || ''} ${teacher.firstName} ${teacher.lastName}`.trim()}
                        </h3>
                        <p className="teacher-role">Teacher</p>
                      </div>
                      <div className="teacher-meta">
                        <span className={`status-badge ${getStatusClass(teacher)}`}>
                          {getStatusText(teacher)}
                        </span>
                        <span className="joined-date">
                          <FaCalendarAlt className="date-icon" />
                          Joined {new Date(teacher.joiningDate || teacher.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="card-right-section">
                      <div className="assignment-badges">
                        {/* Classes badges */}
                        {(teacher.classesAssigned || teacher.classAssigned) && (
                          <div className="classes-badges">
                            {(() => {
                              let classes = [];
                              if (teacher.classesAssigned) {
                                classes = Array.isArray(teacher.classesAssigned) ? teacher.classesAssigned : [teacher.classesAssigned];
                              } else if (teacher.classAssigned) {
                                classes = [teacher.classAssigned];
                              }
                              return classes.map((cls, index) => (
                                <span key={index} className="class-badge">
                                  <FaUserGraduate className="badge-icon" />
                                  {cls}
                                </span>
                              ));
                            })()}
                          </div>
                        )}
                        
                        {/* Subjects badges */}
                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="subjects-badges">
                            {teacher.subjects.map((subject, index) => (
                              <span key={index} className="subject-badge">
                                <FaBookOpen className="badge-icon" />
                                {subject}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="card-actions">
                      <button
                        onClick={() => openModal('view', teacher)}
                        className="action-btn-sm view"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openModal('edit', teacher)}
                        className="action-btn-sm edit"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                  </div>

                  {/* Concise Body */}
                  <div className="concise-card-body">
                    <div className="info-row">
                      <div className="info-item">
                        <FaEnvelope className="icon" />
                        <span>{teacher.email}</span>
                      </div>
                      
                      {teacher.mobile && (
                        <div className="info-item">
                          <FaMobileAlt className="icon" />
                          <span>{teacher.mobile}</span>
                        </div>
                      )}
                    </div>

                    {teacher.preferredSubjects && teacher.preferredSubjects.length > 0 && (
                      <div className="subjects-row">
                        <FaBookOpen className="icon" />
                        <div className="subjects-tags">
                          {teacher.preferredSubjects.slice(0, 3).map((subject, index) => (
                            <span key={index} className="subject-tag">{subject}</span>
                          ))}
                          {teacher.preferredSubjects.length > 3 && (
                            <span className="more-tag">+{teacher.preferredSubjects.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="meta-row">
                      {teacher.experience && (
                        <div className="meta-item">
                          <FaClock className="icon" />
                          <span>{teacher.experience} experience</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Concise Footer */}
                  <div className="concise-card-footer">
                    {!teacher.isApproved ? (
                      <div className="approval-actions">
                        <button
                          onClick={() => handleApproval(teacher._id, true)}
                          className="btn-approve"
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleApproval(teacher._id, false)}
                          className="btn-reject"
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="management-actions">
                        {(teacher.classAssigned || teacher.classesAssigned) ? (
                          <button
                            onClick={() => handleEditAssignment(teacher)}
                            className="btn-edit-assignment"
                            title="Edit Assignment"
                          >
                            <FaUserTie /> Edit Assignment
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setAssignmentMode('assign');
                              setShowAssignmentModal(true);
                            }}
                            className="btn-assign-teacher"
                            title="Assign Teacher"
                          >
                            <FaUserTie /> Assign Teacher
                          </button>
                        )}
                        
                        <button
                          onClick={() => toggleStatus(teacher._id)}
                          className={`btn-toggle ${teacher.isActive ? 'active' : 'inactive'}`}
                        >
                          {teacher.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="btn-delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}

                    <div className="rating-section">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar key={star} className={`star ${star <= (teacher.rating || 4) ? 'filled' : 'empty'}`} />
                        ))}
                      </div>
                      <span className="student-count">{teacher.studentsCount || 0} students</span>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="teachers-pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="teachers-pagination-btn"
            >
              <FaChevronLeft />
            </button>
            
            <span className="teachers-pagination-info">
              Page {currentPage} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="teachers-pagination-btn"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="teacher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="teacher-modal-header">
              <h3 className="modal-title">
                {modalType === 'add' ? 'Add New Teacher' : 
                 modalType === 'edit' ? 'Edit Teacher' : 'Teacher Details'}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="teacher-modal-body">
              {modalType === 'view' ? (
                <div className="teacher-view-details">
                  <div className="teacher-view-item">
                    <div className="teacher-view-icon">
                      <FaGraduationCap />
                    </div>
                    <div className="teacher-view-content">
                      <div className="teacher-view-label">Full Name</div>
                      <div className="teacher-view-value">
                        {`${selectedTeacher?.salutation || ''} ${selectedTeacher?.firstName || ''} ${selectedTeacher?.lastName || ''}`.trim()}
                      </div>
                    </div>
                  </div>

                  <div className="teacher-view-item">
                    <div className="teacher-view-icon">
                      <FaEnvelope />
                    </div>
                    <div className="teacher-view-content">
                      <div className="teacher-view-label">Contact Information</div>
                      <div className="teacher-view-value">
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Email:</strong> {selectedTeacher?.email}
                        </div>
                        <div>
                          <strong>Mobile:</strong> {selectedTeacher?.mobile || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedTeacher?.preferredSubjects && selectedTeacher.preferredSubjects.length > 0 && (
                    <div className="teacher-view-item">
                      <div className="teacher-view-icon">
                        <FaChalkboardTeacher />
                      </div>
                      <div className="teacher-view-content">
                        <div className="teacher-view-label">Preferred Subjects</div>
                        <div className="teacher-view-value">
                          {selectedTeacher.preferredSubjects.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedTeacher?.classAssigned || selectedTeacher?.classesAssigned) && (
                    <div className="teacher-view-item">
                      <div className="teacher-view-icon">
                        <FaUsers />
                      </div>
                      <div className="teacher-view-content">
                        <div className="teacher-view-label">Assignment Details</div>
                        <div className="teacher-view-value">
                          <div style={{ marginBottom: '12px' }}>
                            <strong>Assigned Classes:</strong>
                            <div className="teacher-view-badges" style={{ marginTop: '8px' }}>
                              {(() => {
                                let classes = [];
                                if (selectedTeacher.classesAssigned) {
                                  classes = Array.isArray(selectedTeacher.classesAssigned) ? selectedTeacher.classesAssigned : [selectedTeacher.classesAssigned];
                                } else if (selectedTeacher.classAssigned) {
                                  classes = [selectedTeacher.classAssigned];
                                }
                                return classes.map((cls, index) => (
                                  <span key={index} className="class-badge view-badge">
                                    <FaUserGraduate className="badge-icon" />
                                    Class {cls}
                                  </span>
                                ));
                              })()}
                            </div>
                          </div>
                          {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                            <div>
                              <strong>Teaching Subjects:</strong>
                              <div className="teacher-view-badges" style={{ marginTop: '8px' }}>
                                {selectedTeacher.subjects.map((subject, index) => (
                                  <span key={index} className="subject-badge view-badge">
                                    <FaBookOpen className="badge-icon" />
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="teacher-view-item">
                    <div className="teacher-view-icon">
                      <FaUserCheck />
                    </div>
                    <div className="teacher-view-content">
                      <div className="teacher-view-label">Status Information</div>
                      <div className="teacher-view-value">
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Current Status:</strong>
                          <div className="teacher-view-badge" style={{ marginTop: '8px' }}>
                            <span className={`status-badge status-${getStatusClass(selectedTeacher)}`}>
                              {getStatusText(selectedTeacher)}
                            </span>
                          </div>
                        </div>
                        {selectedTeacher?.experience && (
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Experience:</strong> {selectedTeacher.experience}
                          </div>
                        )}
                        {selectedTeacher?.qualification && (
                          <div>
                            <strong>Qualification:</strong> {selectedTeacher.qualification}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="teacher-view-item">
                    <div className="teacher-view-icon">
                      <FaCalendarAlt />
                    </div>
                    <div className="teacher-view-content">
                      <div className="teacher-view-label">Registration Date</div>
                      <div className="teacher-view-value">
                        {selectedTeacher?.joiningDate || selectedTeacher?.createdAt ? 
                          new Date(selectedTeacher.joiningDate || selectedTeacher.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Salutation</label>
                      <select
                        name="salutation"
                        value={formData.salutation}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        placeholder="Enter last name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Mobile</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter mobile number"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Timezone</label>
                      <input
                        type="text"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., Asia/Kolkata"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Password {modalType === 'edit' ? '(optional)' : '*'}</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input"
                        required={modalType === 'add'}
                        placeholder={modalType === 'edit' ? 'Enter new password (optional)' : 'Enter password'}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 5 years"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Subjects</label>
                    <input
                      type="text"
                      name="preferredSubjects"
                      value={formData.preferredSubjects}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., Mathematics, Physics, Chemistry"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., M.Sc. Mathematics, B.Ed."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Additional notes about the teacher"
                      rows="3"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={closeModal} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                      {modalType === 'add' ? 'Add Teacher' : 'Update Teacher'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Assignment Modal */}
      <TeacherAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        teacher={selectedTeacher}
        onAssignmentComplete={handleAssignmentComplete}
        mode={assignmentMode}
      />
    </div>
  );
};

export default ManageTeachers;
