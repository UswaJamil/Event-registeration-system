import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../Components/Spinner";

// Helper function
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function RegisterForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  // Fetch event details
  useEffect(() => {
    let mounted = true;
    async function fetchEvent() {
      try {
        const docRef = doc(db, "events", eventId);
        const snap = await getDoc(docRef);
        if (snap.exists() && mounted) {
          setEvent({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Error loading event:", err);
      } finally {
        if (mounted) setLoadingEvent(false);
      }
    }
    fetchEvent();
    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(form.email)) {
      alert("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "registrations"), {
        eventId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        timestamp: serverTimestamp(),
      });

      // ✅ Save last registration ID
      localStorage.setItem("lastRegistrationId", docRef.id);

      setForm({ name: "", email: "", phone: "" });
      navigate("/success");
    } catch (err) {
      console.error("Registration error:", err);
      alert("An error occurred while registering. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent)
    return (
      <div className="container center">
        <Spinner size={40} />
      </div>
    );

  if (!event)
    return (
      <div className="container">
        <p>❌ Event not found.</p>
      </div>
    );

  return (
    <div className="container">
      <h2>Register for: {event.title}</h2>
      <p className="muted">
        📅 Date:{" "}
        {event.date
          ? event.date.seconds
            ? new Date(event.date.seconds * 1000).toLocaleDateString()
            : new Date(event.date).toLocaleDateString()
          : "TBA"}
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Phone Number
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>

        <div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Registering..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
