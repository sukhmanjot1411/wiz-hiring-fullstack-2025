import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, User, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { format, formatInTimeZone } from 'date-fns-tz';
import { isPast } from 'date-fns';

interface TimeSlot {
  id: string;
  start_time: string;
  max_bookings: number;
  current_bookings: number;
  available_spots: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  created_at: string;
  slots: TimeSlot[];
}

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${id}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot || !name.trim() || !email.trim()) {
      setError('Please fill in all fields and select a time slot');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot,
          eventId: id,
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      setSuccess('Booking successful! Redirecting...');
      setTimeout(() => {
        navigate('/success', { 
          state: { 
            eventTitle: event?.title,
            slotTime: event?.slots.find(s => s.id === selectedSlot)?.start_time 
          } 
        });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Event Not Found</h1>
          <p className="text-red-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = event.slots.filter(slot => 
    slot.available_spots > 0 && !isPast(new Date(slot.start_time))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </button>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        {/* Event Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-12 text-white">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 mr-3" />
            <span className="text-sm font-medium opacity-90">Event Details</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
          {event.description && (
            <p className="text-lg opacity-90 max-w-2xl">{event.description}</p>
          )}
          <div className="mt-6 flex items-center text-sm opacity-75">
            <span>Created {format(new Date(event.created_at), 'MMMM dd, yyyy')}</span>
            <span className="mx-2">•</span>
            <span>Your timezone: {userTimeZone}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Available Slots */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Available Time Slots
              </h2>

              {availableSlots.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No available slots</p>
                  <p className="text-gray-500 text-sm">All slots are either full or in the past</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedSlot === slot.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                      onClick={() => setSelectedSlot(slot.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {formatInTimeZone(new Date(slot.start_time), userTimeZone, 'EEEE, MMMM dd')}
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            {formatInTimeZone(new Date(slot.start_time), userTimeZone, 'h:mm a zzz')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{slot.available_spots} spots left</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Book Your Slot
              </h2>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={bookingLoading || !selectedSlot || availableSlots.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Book Selected Slot
                      </>
                    )}
                  </button>
                </div>

                {!selectedSlot && availableSlots.length > 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    Please select a time slot to continue
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;