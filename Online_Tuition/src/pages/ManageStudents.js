import React, { useEffect, useState, useRef } from 'react';
import API_BASE_URL from '../config/api';
import '../styles/manageStudents.css';
import { 
  FaUsers, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaUserGraduate,
  FaEnvelope,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserCheck,
  FaDownload
} from 'react-icons/fa';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'view'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    paid: 0
  });
  
  const filterRef = useRef(null);

  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    class: '',
    group: '',
    emisNumber: '',
    approvalStatus: 'Pending',
    status: 'Unpaid'
  });

  // Fetch students from backend
  useEffect(() => {
    fetchStudents();
  }, []);

  // Calculate stats whenever students change
  useEffect(() => {
    const total = students.length;
    const approved = students.filter(s => s.approvalStatus === 'Approved').length;
    const pending = students.filter(s => s.approvalStatus === 'Pending').length;
    const paid = students.filter(s => s.status === 'Paid').length;
    
    setStats({ total, approved, pending, paid });
  }, [students]);

  // Filter and search students
  useEffect(() => {
    let filtered = students;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.emisNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      switch (filterStatus) {
        case 'approved':
          filtered = filtered.filter(s => s.approvalStatus === 'Approved');
          break;
        case 'pending':
          filtered = filtered.filter(s => s.approvalStatus === 'Pending');
          break;
        case 'rejected':
          filtered = filtered.filter(s => s.approvalStatus === 'Rejected');
          break;
        case 'paid':
          filtered = filtered.filter(s => s.status === 'Paid');
          break;
        case 'unpaid':
          filtered = filtered.filter(s => s.status === 'Unpaid');
          break;
        default:
          break;
      }
    }
    
    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [students, searchTerm, filterStatus]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student`);
      const contentType = response.headers.get("content-type");
      
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Not JSON response:", text);
        throw new Error("Server did not return JSON");
      }
      
      const data = await response.json();
      console.log('Fetched students:', data);
      console.log('First student ID example:', data[0]?._id);
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      // Set empty array on error to prevent crashes
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      salutation: '',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      class: '',
      group: '',
      emisNumber: '',
      approvalStatus: 'Pending',
      status: 'Unpaid'
    });
  };

  // Open modal
  const openModal = (type, student = null) => {
    setModalType(type);
    setSelectedStudent(student);
    
    if (type === 'add') {
      resetForm();
    } else if (type === 'edit' && student) {
      setFormData({
        salutation: student.salutation || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        mobile: student.mobile || '',
        class: student.class || '',
        group: student.group || '',
        emisNumber: student.emisNumber || '',
        approvalStatus: student.approvalStatus || 'Pending',
        status: student.status || 'Unpaid'
      });
    }
    
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedStudent(null);
    resetForm();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = modalType === 'add' 
        ? `${API_BASE_URL}/api/student/register`
        : `${API_BASE_URL}/api/student/${selectedStudent._id}`;
      
      const method = modalType === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`${modalType === 'add' ? 'Registration' : 'Update'} failed`);
      }

      const result = await response.json();
      
      if (modalType === 'add') {
        // Refresh the students list
        await fetchStudents();
        alert('✅ Student added successfully');
      } else {
        // Update the specific student in the list
        setStudents(prev => 
          prev.map(stu => stu._id === selectedStudent._id ? result : stu)
        );
        alert('✅ Student updated successfully');
      }
      
      closeModal();
    } catch (err) {
      console.error(err);
      alert(`❌ Error ${modalType === 'add' ? 'adding' : 'updating'} student`);
    }
  };

  // Delete student
  const handleDelete = async (studentId) => {
    if (!studentId) {
      alert('❌ Invalid student ID');
      return;
    }

    // Find the student in our current state to verify it exists
    const studentToDelete = students.find(s => s._id === studentId);
    if (!studentToDelete) {
      alert('❌ Student not found in current list');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${studentToDelete.firstName} ${studentToDelete.lastName}?`)) {
      return;
    }

    try {
      console.log('Attempting to delete student with ID:', studentId);
      console.log('Student details:', studentToDelete);

      const response = await fetch(`${API_BASE_URL}/api/student/${studentId}`, {
        method: 'DELETE'
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed with error:', errorData);
        
        if (response.status === 404) {
          // Student already deleted or doesn't exist
          alert('⚠️ Student not found on server. Removing from list...');
          setStudents(prev => prev.filter(stu => stu._id !== studentId));
          return;
        }
        
        throw new Error(errorData.message || `Delete failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Delete success:', result);

      setStudents(prev => prev.filter(stu => stu._id !== studentId));
      alert('✅ Student deleted successfully');
    } catch (err) {
      console.error('Delete error details:', err);
      alert(`❌ Error deleting student: ${err.message}`);
    }
  };

  // Approve or reject a student
  const handleApproval = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Approval failed');

      const updated = await response.json();

      setStudents(prev =>
        prev.map(stu => (stu._id === id ? updated : stu))
      );

      if (status === 'Approved') {
        alert(`✅ Approval email sent to ${updated.email}`);
      } else {
        alert(`✅ Student ${status.toLowerCase()} successfully`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error processing approval');
    }
  };

  // Toggle payment status
  const togglePayment = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/${id}/payment`, {
        method: 'PUT'
      });

      if (!response.ok) throw new Error('Payment toggle failed');

      const updated = await response.json();

      setStudents(prev =>
        prev.map(stu => (stu._id === id ? updated : stu))
      );

      alert('✅ Payment status updated successfully');
    } catch (err) {
      console.error(err);
      alert('❌ Error updating payment status');
    }
  };

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get status badge class
  const getStatusClass = (status, type) => {
    if (type === 'approval') {
      switch (status) {
        case 'Approved': return 'status-approved';
        case 'Rejected': return 'status-rejected';
        default: return 'status-pending';
      }
    } else {
      return status === 'Paid' ? 'status-paid' : 'status-unpaid';
    }
  };

  // Get student initials for photo placeholder
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' }
  ];

  return (
    <div className="student-management-container">
      {/* Header Section */}
      <div className="student-management-header">
        <div className="student-header-content">
          <h2>
            <FaUsers className="student-header-icon" />
            Manage Students
          </h2>
          <p>Student management with enrollment tracking and payment monitoring</p>
          
          <div className="student-statistics-row">
            <div className="student-stat-card">
              <span className="student-stat-number">{stats.total}</span>
              <span className="student-stat-label">Total Students</span>
            </div>
            <div className="student-stat-card">
              <span className="student-stat-number">{stats.approved}</span>
              <span className="student-stat-label">Approved</span>
            </div>
            <div className="student-stat-card">
              <span className="student-stat-number">{stats.pending}</span>
              <span className="student-stat-label">Pending</span>
            </div>
            <div className="student-stat-card">
              <span className="student-stat-number">{stats.paid}</span>
              <span className="student-stat-label">Paid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="students-controls">
        <div className="controls-row">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, class, or EMIS number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="controls-right">
            <div className="filter-dropdown" ref={filterRef}>
              <button 
                className="filter-btn"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FaFilter />
                Filter
              </button>
              
              {showFilterMenu && (
                <div className="filter-menu">
                  {filterOptions.map(option => (
                    <div
                      key={option.value}
                      className={`filter-option ${filterStatus === option.value ? 'active' : ''}`}
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
              className="add-student-btn"
              onClick={() => openModal('add')}
            >
              <FaPlus />
              Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="students-container">
        {loading ? (
          <div className="students-loading-spinner">
            <div className="students-spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : currentStudents.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>No students found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="students-grid">
              {currentStudents.map((student) => (
                <div key={student._id} className="student-card">
                  {/* Card Header */}
                  <div className="student-card-header">
                    <div className="student-profile">
                      <div className="student-avatar">
                        {getInitials(student.firstName, student.lastName)}
                      </div>
                      <div className="student-info">
                        <div className="student-name">
                          <FaUserGraduate style={{ color: '#059669' }} />
                          {`${student.salutation || ''} ${student.firstName || ''} ${student.lastName || ''}`.trim()}
                        </div>
                        <div className="student-id">
                          ID: {student._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <div className="student-badges">
                      <span className={`status-badge ${getStatusClass(student.approvalStatus, 'approval')}`}>
                        {student.approvalStatus}
                      </span>
                      {student.approvalStatus === 'Approved' && (
                        <span className={`status-badge ${getStatusClass(student.status, 'payment')}`}>
                          {student.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="student-card-body">
                    <div className="student-detail-group">
                      <div className="student-detail-label">
                        <FaEnvelope />
                        Contact Information
                      </div>
                      <div className="student-detail-value">
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Email:</strong> {student.email}
                        </div>
                        {student.mobile && (
                          <div>
                            <strong>Mobile:</strong> {student.mobile}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="student-detail-group">
                      <div className="student-detail-label">
                        <FaUserGraduate />
                        Academic Details
                      </div>
                      <div className="student-detail-value">
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Class:</strong> {student.class}
                        </div>
                        {student.group && (
                          <div style={{ marginBottom: '8px' }}>
                            <strong>Group:</strong> {student.group}
                          </div>
                        )}
                        <div>
                          <strong>EMIS:</strong> {student.emisNumber || '—'}
                        </div>
                      </div>
                    </div>

                    {student.approvalStatus === 'Approved' && (
                      <div className="student-detail-group">
                        <div className="student-detail-label">
                          <FaMoneyBillWave />
                          Payment Status
                        </div>
                        <div className="student-detail-value">
                          <span className={`status-badge ${getStatusClass(student.status, 'payment')}`}>
                            {student.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="student-card-footer">
                    <div className="student-registration-date">
                      <FaCalendarAlt />
                      <span>
                        Registered: {student.registeredAt ? new Date(student.registeredAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div className="student-actions">
                      {student.approvalStatus === 'Pending' ? (
                        <>
                          <button 
                            onClick={() => handleApproval(student._id, 'Approved')} 
                            className="action-btn btn-approve"
                            title="Approve Student"
                          >
                            <FaCheck />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleApproval(student._id, 'Rejected')} 
                            className="action-btn btn-reject"
                            title="Reject Student"
                          >
                            <FaTimes />
                            Reject
                          </button>
                        </>
                      ) : student.approvalStatus === 'Approved' ? (
                        <button 
                          onClick={() => togglePayment(student._id)} 
                          className="action-btn btn-toggle"
                          title={`Mark as ${student.status === 'Paid' ? 'Unpaid' : 'Paid'}`}
                        >
                          <FaMoneyBillWave />
                          {student.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      ) : null}
                      
                      <button 
                        onClick={() => openModal('view', student)} 
                        className="action-btn btn-edit"
                        title="View Details"
                      >
                        <FaEye />
                        View
                      </button>
                      
                      <button 
                        onClick={() => openModal('edit', student)} 
                        className="action-btn btn-edit"
                        title="Edit Student"
                      >
                        <FaEdit />
                        Edit
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(student._id)} 
                        className="action-btn btn-delete"
                        title="Delete Student"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
                </div>
                
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FaChevronLeft />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    className="pagination-btn"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="student-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="student-modal-header">
              <h3 className="student-modal-title">
                {modalType === 'add' ? 'Add New Student' : 
                 modalType === 'edit' ? 'Edit Student' : 'Student Details'}
              </h3>
              <button className="student-modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="student-modal-body">
              {modalType === 'view' ? (
                <div className="student-view-details">
                  <div className="student-view-item">
                    <div className="student-view-icon">
                      <FaUserGraduate />
                    </div>
                    <div className="student-view-content">
                      <div className="student-view-label">Full Name</div>
                      <div className="student-view-value">
                        {`${selectedStudent?.salutation || ''} ${selectedStudent?.firstName || ''} ${selectedStudent?.lastName || ''}`.trim()}
                      </div>
                    </div>
                  </div>

                  <div className="student-view-item">
                    <div className="student-view-icon">
                      <FaEnvelope />
                    </div>
                    <div className="student-view-content">
                      <div className="student-view-label">Contact Information</div>
                      <div className="student-view-value">
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Email:</strong> {selectedStudent?.email}
                        </div>
                        <div>
                          <strong>Mobile:</strong> {selectedStudent?.mobile || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="student-view-item">
                    <div className="student-view-icon">
                      <FaUserGraduate />
                    </div>
                    <div className="student-view-content">
                      <div className="student-view-label">Academic Details</div>
                      <div className="student-view-value">
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Class:</strong> {selectedStudent?.class}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Group:</strong> {selectedStudent?.group || 'Not specified'}
                        </div>
                        <div>
                          <strong>EMIS Number:</strong> {selectedStudent?.emisNumber || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="student-view-item">
                    <div className="student-view-icon">
                      <FaUserCheck />
                    </div>
                    <div className="student-view-content">
                      <div className="student-view-label">Status Information</div>
                      <div className="student-view-value">
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Approval Status:</strong>
                          <div className="student-view-badge">
                            <span className={`status-badge ${getStatusClass(selectedStudent?.approvalStatus, 'approval')}`}>
                              {selectedStudent?.approvalStatus}
                            </span>
                          </div>
                        </div>
                        <div>
                          <strong>Payment Status:</strong>
                          <div className="student-view-badge">
                            <span className={`status-badge ${getStatusClass(selectedStudent?.status, 'payment')}`}>
                              {selectedStudent?.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="student-view-item">
                    <div className="student-view-icon">
                      <FaCalendarAlt />
                    </div>
                    <div className="student-view-content">
                      <div className="student-view-label">Registration Date</div>
                      <div className="student-view-value">
                        {selectedStudent?.registeredAt ? new Date(selectedStudent.registeredAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {selectedStudent?.proof && (
                    <div className="student-view-item">
                      <div className="student-view-icon">
                        <FaDownload />
                      </div>
                      <div className="student-view-content">
                        <div className="student-view-label">Student Proof Document</div>
                        <div className="student-view-value">
                          <a 
                            href={`/${selectedStudent.proof}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="student-document-link"
                          >
                            <FaDownload />
                            View Document
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="student-form-row">
                    <div className="student-form-group">
                      <label className="student-form-label">Salutation</label>
                      <select
                        name="salutation"
                        value={formData.salutation}
                        onChange={handleInputChange}
                        className="student-form-select"
                      >
                        <option value="">Select</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                      </select>
                    </div>
                    
                    <div className="student-form-group">
                      <label className="student-form-label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="student-form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="student-form-row">
                    <div className="student-form-group">
                      <label className="student-form-label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="student-form-input"
                        required
                      />
                    </div>
                    
                    <div className="student-form-group">
                      <label className="student-form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="student-form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="student-form-row">
                    <div className="student-form-group">
                      <label className="student-form-label">Mobile</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="student-form-input"
                      />
                    </div>
                    
                    <div className="student-form-group">
                      <label className="student-form-label">Class *</label>
                      <input
                        type="text"
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                        className="student-form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="student-form-row">
                    <div className="student-form-group">
                      <label className="student-form-label">Group</label>
                      <input
                        type="text"
                        name="group"
                        value={formData.group}
                        onChange={handleInputChange}
                        className="student-form-input"
                      />
                    </div>
                    
                    <div className="student-form-group">
                      <label className="student-form-label">EMIS Number</label>
                      <input
                        type="text"
                        name="emisNumber"
                        value={formData.emisNumber}
                        onChange={handleInputChange}
                        className="student-form-input"
                      />
                    </div>
                  </div>

                  <div className="student-form-row">
                    <div className="student-form-group">
                      <label className="student-form-label">Approval Status</label>
                      <select
                        name="approvalStatus"
                        value={formData.approvalStatus}
                        onChange={handleInputChange}
                        className="student-form-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    
                    <div className="student-form-group">
                      <label className="student-form-label">Payment Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="student-form-select"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  <div className="student-form-actions">
                    <button type="button" className="student-btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className="student-btn-primary">
                      {modalType === 'add' ? 'Add Student' : 'Update Student'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
