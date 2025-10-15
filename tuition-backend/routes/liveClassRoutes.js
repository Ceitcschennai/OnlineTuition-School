const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getLiveClasses, addLiveClass, removeLiveClass, updateLiveClass } = require('../socket/socketHandler');

const router = express.Router();

// Middleware to handle sendBeacon blob data
router.use(express.json());
router.use(express.raw({ type: 'application/json' }));

// Get all live classes
router.get('/', (req, res) => {
  try {
    const liveClasses = getLiveClasses();
    res.json(liveClasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start a live class
router.post('/start', (req, res) => {
  try {
    const { subject, teacher, teacherId, class: className, roomName, jitsiUrl } = req.body;
    console.log('Starting live class with data:', req.body);

    if (!subject || !teacher || !teacherId || !className) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const meetingId = uuidv4();
    const newLiveClass = {
      id: uuidv4(),
      meetingId: meetingId,
      subject,
      teacher,
      teacherId,
      class: className,
      roomName: roomName || `${subject}-${className}-${Date.now()}`,
      jitsiUrl: jitsiUrl || `https://meet.jit.si/${roomName}`,
      isLive: true,
      startTime: new Date(),
      participants: []
    };

    addLiveClass(newLiveClass);

    const io = req.app.get('io');
    if (io) {
      io.emit('liveClassesUpdate', getLiveClasses());
      console.log('Broadcasted live class update');
    }

    res.json({ success: true, liveClass: newLiveClass });
  } catch (error) {
    console.error('Error starting live class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Student joins live class
router.post('/join', (req, res) => {
  try {
    const { classId, studentId, studentName, studentEmail } = req.body;

    console.log('Student joining:', { classId, studentId, studentName });

    if (!classId || !studentId || !studentName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: classId, studentId, studentName'
      });
    }

    const liveClasses = getLiveClasses();
    const liveClass = liveClasses.find(cls => cls.id === classId);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Check if student already in participants
    const existingParticipant = liveClass.participants.find(p => p.studentId === studentId);

    if (!existingParticipant) {
      // Add student to participants
      const participant = {
        studentId,
        name: studentName,
        email: studentEmail,
        joinTime: new Date()
      };

      liveClass.participants.push(participant);
      updateLiveClass(classId, liveClass);

      // Broadcast update via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('liveClassesUpdate', getLiveClasses());
        io.emit('studentJoined', { 
          classId, 
          studentId, 
          studentName,
          participant 
        });
      }

      console.log(`✅ Student ${studentName} joined class ${classId}`);
    } else {
      console.log(`Student ${studentName} already in class`);
    }

    res.json({ 
      success: true, 
      message: 'Joined successfully',
      participant: liveClass.participants.find(p => p.studentId === studentId)
    });
  } catch (error) {
    console.error('Error joining live class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Student leaves live class
router.post('/leave', (req, res) => {
  try {
    let classId, studentId;

    // Handle both JSON and sendBeacon blob data
    if (Buffer.isBuffer(req.body)) {
      const data = JSON.parse(req.body.toString());
      classId = data.classId;
      studentId = data.studentId;
    } else {
      classId = req.body.classId;
      studentId = req.body.studentId;
    }

    console.log('Student leaving:', { classId, studentId });

    if (!classId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: classId, studentId'
      });
    }

    const liveClasses = getLiveClasses();
    const liveClass = liveClasses.find(cls => cls.id === classId);

    if (!liveClass) {
      return res.status(404).json({
        success: false,
        message: 'Live class not found'
      });
    }

    // Find and remove student from participants
    const participantIndex = liveClass.participants.findIndex(p => p.studentId === studentId);
    
    if (participantIndex !== -1) {
      const participant = liveClass.participants[participantIndex];
      liveClass.participants.splice(participantIndex, 1);
      
      updateLiveClass(classId, liveClass);

      // Broadcast update via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('liveClassesUpdate', getLiveClasses());
        io.emit('studentLeft', { 
          classId, 
          studentId,
          leaveTime: new Date()
        });
      }

      console.log(`✅ Student ${participant.name} left class ${classId}`);
    } else {
      console.log(`Student ${studentId} was not in participants list`);
    }

    res.json({ 
      success: true, 
      message: 'Left successfully'
    });
  } catch (error) {
    console.error('Error leaving live class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// End a live class
router.delete('/end/:classId', (req, res) => {
  try {
    const { classId } = req.params;
    removeLiveClass(classId);
    
    const io = req.app.get('io');
    if (io) {
      io.emit('liveClassesUpdate', getLiveClasses());
    }
    
    console.log(`Live class ${classId} ended`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get live classes for a specific class
router.get('/class/:className', (req, res) => {
  try {
    const { className } = req.params;
    const liveClasses = getLiveClasses();
    const classLiveClasses = liveClasses.filter(cls => cls.class === className && cls.isLive);
    res.json(classLiveClasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get live classes by teacher
router.get('/teacher/:teacherId', (req, res) => {
  try {
    const { teacherId } = req.params;
    const liveClasses = getLiveClasses();
    const teacherClasses = liveClasses.filter(cls => cls.teacherId === teacherId && cls.isLive);
    res.json(teacherClasses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
