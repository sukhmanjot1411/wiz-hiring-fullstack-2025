import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, ArrowRight, Home } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventTitle, slotTime } = location.state || {};

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!eventTitle || !slotTime) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">Invalid Access</h1>
          <p className="text-yellow-600 mb-4">This page can only be accessed after a successful booking.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center text-gray-700">
              <Calendar className="h-5 w-5 mr-3 text-green-600" />
              <div className="text-left">
                <div className="font-semibold">{eventTitle}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center text-gray-700">
              <Clock className="h-5 w-5 mr-3 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold">
                  {formatInTimeZone(new Date(slotTime), userTimeZone, 'EEEE, MMMM dd, yyyy')}
                </div>
                <div className="text-sm text-gray-600">
                  {formatInTimeZone(new Date(slotTime), userTimeZone, 'h:mm a zzz')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Next?</h3>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>You'll receive a confirmation email shortly (if applicable)</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Add this event to your calendar so you don't forget</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Check your bookings anytime using the "My Bookings" page</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/bookings"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-all shadow-lg"
          >
            View My Bookings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="mr-2 h-4 w-4" />
            Browse More Events
          </Link>
        </div>

        {/* Footer Message */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Thank you for using BookMySlot! We hope you have a great experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;