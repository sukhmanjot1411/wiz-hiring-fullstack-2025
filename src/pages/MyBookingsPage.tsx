import React, { useState } from 'react';
import { Calendar, Clock, Mail, Search, AlertCircle } from 'lucide-react';
import { format, formatInTimeZone } from 'date-fns-tz';
import { isPast } from 'date-fns';

interface Booking {
  id: string;
  name: string;
  email: string;
  created_at: string;
  event_title: string;
  event_description: string;
  start_time: string;
}

const MyBookingsPage = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/bookings/user/${encodeURIComponent(email.trim())}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data);
      setSearched(true);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(booking => !isPast(new Date(booking.start_time)));
  const pastBookings = bookings.filter(booking => isPast(new Date(booking.start_time)));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl w-fit mx-auto mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View all your scheduled appointments</p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your email to view bookings
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {searched && bookings.length === 0 && (
          <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-300">
            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              No bookings were found for <span className="font-medium">{email}</span>
            </p>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Upcoming Bookings ({upcomingBookings.length})
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.event_title}
                          </h3>
                          {booking.event_description && (
                            <p className="text-gray-600 text-sm mb-3">
                              {booking.event_description}
                            </p>
                          )}
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Upcoming
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-3" />
                          <div>
                            <div className="font-medium">
                              {formatInTimeZone(new Date(booking.start_time), userTimeZone, 'EEEE, MMMM dd, yyyy')}
                            </div>
                            <div className="text-sm">
                              {formatInTimeZone(new Date(booking.start_time), userTimeZone, 'h:mm a zzz')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-3" />
                          <div>
                            <div className="font-medium">{booking.name}</div>
                            <div className="text-sm">{booking.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Booked on {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  Past Bookings ({pastBookings.length})
                </h2>
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.event_title}
                          </h3>
                          {booking.event_description && (
                            <p className="text-gray-600 text-sm mb-3">
                              {booking.event_description}
                            </p>
                          )}
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-3" />
                          <div>
                            <div className="font-medium">
                              {formatInTimeZone(new Date(booking.start_time), userTimeZone, 'EEEE, MMMM dd, yyyy')}
                            </div>
                            <div className="text-sm">
                              {formatInTimeZone(new Date(booking.start_time), userTimeZone, 'h:mm a zzz')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-3" />
                          <div>
                            <div className="font-medium">{booking.name}</div>
                            <div className="text-sm">{booking.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Booked on {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;