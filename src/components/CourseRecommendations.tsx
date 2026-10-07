"use client";

import React, { useState } from "react";
import { SuggestedCourseResult } from "@/lib/schema";
import { LEARNERS_TRACK_COURSES } from "@/config/courses";
import {
  GraduationCap,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowRight,
  Clock,
  Tag,
  CheckCircle2,
  X,
  Send,
} from "lucide-react";

interface CourseRecommendationsProps {
  suggestedCourses: SuggestedCourseResult[];
  counsellorPhone?: string;
  leadName?: string;
  leadPhone?: string;
}

export default function CourseRecommendations({
  suggestedCourses,
  counsellorPhone = "+919876543210",
  leadName = "",
  leadPhone = "",
}: CourseRecommendationsProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");

  const cleanPhone = counsellorPhone.replace(/[^0-9]/g, "");

  const handleOpenBooking = (courseName: string) => {
    setSelectedCourse(courseName);
    setShowModal(true);
  };

  const handleWhatsAppDirect = (courseName: string) => {
    const text = encodeURIComponent(
      `Hi Learners Track! My name is ${leadName || "a student"}. I recently analyzed my resume and would like to speak to a career counselor regarding the "${courseName}" program.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const handleConfirmCall = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      // Direct to WhatsApp with pre-filled lead info
      const text = encodeURIComponent(
        `Hi Learners Track! My name is ${leadName}. I'd like to book a free career counselling call for "${selectedCourse}". My notes: ${bookingNotes || "None"}.`
      );
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
      setShowModal(false);
      setBookingSuccess(false);
    }, 1200);
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-card p-6 sm:p-8 border border-blue-100 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Learners Track Curriculum Recommendations</span>
          </div>
          <h3 className="font-heading font-extrabold text-xl text-lt-blue-dark flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-lt-blue" />
            <span>Targeted Skill Programs For Your Profile</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Based on the gaps detected in your resume, these curated Learners Track courses will help you build production-ready projects and ace interviews.
          </p>
        </div>

        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Hi Learners Track! I reviewed my resume and would like a free career counselling call.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md transition-all self-start sm:self-auto flex-shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Quick WhatsApp Counsellor</span>
        </a>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedCourses.map((sug, idx) => {
          // Find matching course details from config
          const courseDetail =
            LEARNERS_TRACK_COURSES.find(
              (c) => c.name.toLowerCase() === sug.name.toLowerCase()
            ) || LEARNERS_TRACK_COURSES[idx % LEARNERS_TRACK_COURSES.length];

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-hover hover:border-lt-blue/40 transition-all duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-lt-blue border border-blue-100">
                    {courseDetail.level}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{courseDetail.duration}</span>
                  </span>
                </div>

                <h4 className="font-heading font-bold text-base text-slate-900 group-hover:text-lt-blue transition-colors">
                  {sug.name}
                </h4>

                {/* Why it fits reason */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">
                    🎯 Why this fits your resume:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{sug.reason}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {courseDetail.shortDescription}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {courseDetail.tags.slice(0, 3).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenBooking(sug.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Book Free Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWhatsAppDirect(sug.name)}
                  className="p-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition-colors"
                  title="Inquire on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-lt-blue flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  Book a Free Career Counselling Call
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Selected Course: <strong className="text-lt-blue">{selectedCourse}</strong>
                </p>
              </div>

              {bookingSuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">Connecting you with our counselor...</p>
                </div>
              ) : (
                <form onSubmit={handleConfirmCall} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Candidate Name
                    </label>
                    <input
                      type="text"
                      defaultValue={leadName}
                      disabled
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      defaultValue={leadPhone}
                      disabled
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Any questions or preferred call timing?
                    </label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="e.g. Call after 5 PM, interested in placement records..."
                      rows={3}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-lt-blue"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm & Chat on WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
