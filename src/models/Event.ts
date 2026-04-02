import mongoose from "mongoose";

export interface IRegistrationEntry {
  name: string;
  regNo: string;
  college: string;
  year: number;
  mobile: string;
  email: string;
  registeredAt: Date;
}

export interface IAgendaItem {
  time: string;  // e.g. "09:00"
  topic: string; // e.g. "Introduction to Git"
}

export interface IEvent extends mongoose.Document {
  title: string;
  slug: string; // unique identifier
  description: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm" (24h)
  endTime: string; // "HH:mm" (24h)
  venue: string;
  category: "workshop" | "talk" | "hackathon" | "meetup" | "other";
  handledBy: string; // Speaker name
  organizers: string[]; // Array of organizer names
  poster?: string; // URL from Vercel Blob
  photos?: string[]; // Array of URLs for completed events
  agenda?: IAgendaItem[]; // Scheduled agenda items (for upcoming events)
  outcomes?: string; // Summary of results/takeaways (for completed events)
  status: "upcoming" | "completed" | "draft";
  isFeatured?: boolean;
  registrationsCount: number;
  registrations: IRegistrationEntry[]; // Added internal registrations array
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new mongoose.Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    startDate: {
      type: String,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String,
      required: [true, "End date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    category: {
      type: String,
      enum: ["workshop", "talk", "hackathon", "meetup", "other"],
      required: true,
    },
    handledBy: {
      type: String,
      required: [true, "Speaker/HandledBy is required"],
    },
    organizers: [{
      type: String,
    }],
    poster: {
      type: String,
    },
    photos: [{
      type: String,
    }],
    agenda: [
      {
        time:  { type: String, required: true },
        topic: { type: String, required: true },
      }
    ],
    outcomes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "draft"],
      default: "upcoming",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    registrationsCount: {
      type: Number,
      default: 0,
    },
    registrations: [
      {
        name: { type: String, required: true },
        regNo: { type: String, required: true },
        college: { type: String, required: true },
        year: { type: Number, required: true },
        mobile: { type: String, required: true },
        email: { type: String, required: true },
        registeredAt: { type: Date, default: Date.now },
      }
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);
