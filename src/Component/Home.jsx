import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';


const Home = () => {
  // Initialize with no bookings
  const getInitialItems = () => {
    const localData = localStorage.getItem('travelBookings');
    return localData ? JSON.parse(localData) : [];
  };

  const [bookings, setBookings] = useState(getInitialItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    transport: 'bus',
    from: '',
    to: '',
    phone: '',
    seats: '1',
    price: '',
    notes: ''
  });
  const [validated, setValidated] = useState(false);

  // Refs for scrolling
  const formRef = useRef(null);
  const listRef = useRef(null);

  // Load bookings from localStorage
  useEffect(() => {
    const fetchBookings = () => {
      setLoading(true);
      try {
        const storedBookings = localStorage.getItem('travelBookings');
        if (storedBookings) {
          setBookings(JSON.parse(storedBookings));
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(fetchBookings, 500);
  }, []);

  // Save bookings to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('travelBookings', JSON.stringify(bookings));
    }
  }, [bookings, loading]);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle adding or updating a booking
  const handleAdd = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (editIndex !== null) {
      const updatedBookings = [...bookings];
      updatedBookings[editIndex] = { ...formData, id: bookings[editIndex].id };
      setBookings(updatedBookings);
      setEditIndex(null);
    } else {
      const newBooking = { ...formData, id: Date.now() };
      setBookings([...bookings, newBooking]);
      // Scroll to booking list
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setFormData({
      name: '', date: '', time: '', transport: 'bus', from: '', to: '',
      phone: '', seats: '1', price: '', notes: ''
    });
    setValidated(false);
  };

  // Handle editing a booking
  const handleEdit = (index) => {
    setFormData(bookings[index]);
    setEditIndex(index);
    // Scroll to form
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle new booking
  const handleNewBooking = () => {
    setFormData({
      name: '', date: '', time: '', transport: 'bus', from: '', to: '',
      phone: '', seats: '1', price: '', notes: ''
    });
    setEditIndex(null);
    setValidated(false);
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle deleting a booking
  const handleDelete = (index) => {
    setBookingToDelete(index);
    setShowModal(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    const updatedBookings = bookings.filter((_, i) => i !== bookingToDelete);
    setBookings(updatedBookings);
    setShowModal(false);
    if (editIndex === bookingToDelete) setEditIndex(null);
  };

  // Helper to get transport icon
  const getTransportIcon = (transport) => {
    switch (transport) {
      case 'bus': return 'bi-bus-front';
      case 'train': return 'bi-train-front';
      case 'plane': return 'bi-airplane';
      default: return 'bi-question-circle';
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking =>
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render Navbar
  const renderNavbar = () => (
    <nav className="navbar navbar-expand-lg">
      <Container>
        <a className="navbar-brand" href="#!">
          <i className="bi bi-globe-americas me-2"></i>TravelEasy
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link active" href="#!">My Bookings</a>
            </li>
          </ul>
        </div>
      </Container>
    </nav>
  );

  // Render Booking Form
  const renderBookingForm = () => (
    <Container ref={formRef}>
      <div className={`form-header text-center mb-4 ${editIndex !== null ? 'edit-mode' : ''}`}>
        <h2>{editIndex !== null ? 'Edit Booking' : 'Book Your Trip'}</h2>
        <p>{editIndex !== null ? 'Update your travel details below.' : 'Fill in the details to secure your ticket.'}</p>
      </div>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className={`booking-form-card ${editIndex !== null ? 'edit-mode' : ''}`}>
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleAdd}>
                <div className="transport-selector">
                  {['bus', 'train', 'plane'].map(type => (
                    <div
                      key={type}
                      className={`transport-option ${type} ${formData.transport === type ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, transport: type })}
                    >
                      <i className={`bi ${getTransportIcon(type)}`}></i>
                      <div>{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    </div>
                  ))}
                </div>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter your name"
                      />
                      <Form.Control.Feedback type="invalid">Please provide a name.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        required
                        placeholder="Enter phone number"
                      />
                      <Form.Control.Feedback type="invalid">Please provide a phone number.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>From</Form.Label>
                      <Form.Control
                        type="text"
                        name="from"
                        value={formData.from}
                        onChange={handleFormChange}
                        required
                        placeholder="Departure city"
                      />
                      <Form.Control.Feedback type="invalid">Please provide a departure city.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>To</Form.Label>
                      <Form.Control
                        type="text"
                        name="to"
                        value={formData.to}
                        onChange={handleFormChange}
                        required
                        placeholder="Destination city"
                      />
                      <Form.Control.Feedback type="invalid">Please provide a destination city.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleFormChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please select a date.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleFormChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please select a time.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Number of Seats</Form.Label>
                      <Form.Control
                        type="number"
                        name="seats"
                        min="1"
                        max="10"
                        value={formData.seats}
                        onChange={handleFormChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">Please select 1-10 seats.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleFormChange}
                        required
                        placeholder="0.00"
                      />
                      <Form.Control.Feedback type="invalid">Please enter a valid price.</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Special Requests (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Any special requests?"
                  />
                </Form.Group>
                <div className="d-flex justify-content-end mt-4">
                  <Button variant="secondary" onClick={() => {
                    setFormData({
                      name: '', date: '', time: '', transport: 'bus', from: '', to: '',
                      phone: '', seats: '1', price: '', notes: ''
                    });
                    setEditIndex(null);
                    setValidated(false);
                  }} className="me-2">
                    Cancel
                  </Button>
                  <Button variant={formData.transport || 'primary'} type="submit">
                    {editIndex !== null ? 'Update Booking' : 'Book Ticket'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  // Render Booking List
  const renderBookingList = () => (
    <div className="home-page" ref={listRef}>
      <div className="hero-section text-center">
        <h1>Explore the World with TravelEasy</h1>
        <p>Book your bus, train, or plane tickets effortlessly.</p>
      </div>
      <Container>
        <div className="action-bar mb-4 d-flex align-items-center gap-3">
          <Form.Control
            type="text"
            placeholder="Search by name, departure, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button variant="primary" onClick={handleNewBooking}>
            <i className="bi bi-plus-circle me-1"></i> New Booking
          </Button>
        </div>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="no-bookings text-center my-5">
            <i className="bi bi-calendar-x empty-icon"></i>
            <h3>No Bookings Yet</h3>
            <p>Start your journey by booking a ticket!</p>
            <Button variant="primary" onClick={handleNewBooking}>
              <i className="bi bi-plus-circle me-1"></i> Book Now
            </Button>
          </div>
        ) : (
          <Row>
            {filteredBookings.map((booking, index) => (
              <Col key={booking.id} xs={12} md={6} lg={4} className="mb-4">
                <Card className={`booking-card ${booking.transport}-card`}>
                  <Card.Body>
                    <Card.Title>{booking.name}</Card.Title>
                    <div className="booking-details">
                      <p><i className="bi bi-calendar3"></i> {booking.date}</p>
                      <p><i className="bi bi-clock"></i> {booking.time}</p>
                      <div className="destination">
                        <div className="location-from">{booking.from}</div>
                        <div className="route-line">
                          <i className={`bi ${getTransportIcon(booking.transport)}`}></i>
                        </div>
                        <div className="location-to">{booking.to}</div>
                      </div>
                      <p><i className="bi bi-person"></i> {booking.seats} seat(s)</p>
                      <p><i className="bi bi-currency-dollar"></i> ${booking.price}</p>
                    </div>
                    {booking.notes && (
                      <div className="notes-section">
                        <small>Notes:</small>
                        <p>{booking.notes}</p>
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0">
                    <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(index)}>
                      <i className="bi bi-pencil me-1"></i> Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(index)}>
                      <i className="bi bi-trash me-1"></i> Delete
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );

  // Render Delete Modal
  const renderDeleteModal = () => (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Deletion</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete this booking?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className="app-container">
      {renderNavbar()}
      <div className="content-wrapper">
        {renderBookingForm()}
        {renderBookingList()}
      </div>
      {renderDeleteModal()}
      <footer>
        <Container>
          <div className="footer-content">
            <div>
              <div className="footer-brand">TravelEasy</div>
              <p>© 2025 All Rights Reserved</p>
            </div>
            <div className="footer-links">
              <a href="#!">Privacy Policy</a>
              <a href="#!">Terms of Service</a>
              <a href="#!">Contact Us</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Home;