import { supabase } from "@/lib/supabase";

export async function getEvents(filters?: { status?: string; isFeatured?: boolean }) {
  let q = supabase.from("events").select("*");
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.isFeatured !== undefined) q = q.eq("is_featured", filters.isFeatured);
  
  const { data, error } = await q.order("start_date", { ascending: false });
  if (error) throw error;

  return data.map(item => ({
    ...item,
    _id: item.id,
    academicYear: item.academic_year,
    startDate: item.start_date,
    endDate: item.end_date,
    startTime: item.start_time,
    endTime: item.end_time,
    handledBy: item.handled_by,
    speaker: item.speaker || "",
    galleryLink: item.gallery_link,
    manualStatus: item.manual_status,
    isFeatured: item.is_featured,
    registrationsCount: item.registrations_count,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

export async function getEventBySlug(slug: string) {
  const { data, error } = await supabase.from("events").select("*").eq("slug", slug.toLowerCase().trim()).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    _id: data.id,
    academicYear: data.academic_year,
    startDate: data.start_date,
    endDate: data.end_date,
    startTime: data.start_time,
    endTime: data.end_time,
    handledBy: data.handled_by,
    speaker: data.speaker || "",
    galleryLink: data.gallery_link,
    manualStatus: data.manual_status,
    isFeatured: data.is_featured,
    registrationsCount: data.registrations_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function addEvent(ev: any) {
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: ev.title,
      slug: ev.slug.toLowerCase().trim(),
      description: ev.description,
      agenda: ev.agenda || [],
      outcomes: ev.outcomes || "",
      academic_year: ev.academicYear,
      start_date: ev.startDate,
      end_date: ev.endDate,
      start_time: ev.startTime,
      end_time: ev.endTime,
      venue: ev.venue,
      category: ev.category,
      handled_by: ev.handledBy,
      speaker: ev.speaker || "",
      organizers: ev.organizers || [],
      poster: ev.poster,
      photos: ev.photos || [],
      gallery_link: ev.galleryLink || "",
      status: ev.status || "upcoming",
      manual_status: ev.manualStatus || false,
      is_featured: ev.isFeatured || false
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, ev: any) {
  const mapped: any = {};
  if (ev.title !== undefined) mapped.title = ev.title;
  if (ev.slug !== undefined) mapped.slug = ev.slug.toLowerCase().trim();
  if (ev.description !== undefined) mapped.description = ev.description;
  if (ev.agenda !== undefined) mapped.agenda = ev.agenda;
  if (ev.outcomes !== undefined) mapped.outcomes = ev.outcomes;
  if (ev.academicYear !== undefined) mapped.academic_year = ev.academicYear;
  if (ev.startDate !== undefined) mapped.start_date = ev.startDate;
  if (ev.endDate !== undefined) mapped.end_date = ev.endDate;
  if (ev.startTime !== undefined) mapped.start_time = ev.startTime;
  if (ev.endTime !== undefined) mapped.end_time = ev.endTime;
  if (ev.venue !== undefined) mapped.venue = ev.venue;
  if (ev.category !== undefined) mapped.category = ev.category;
  if (ev.handledBy !== undefined) mapped.handled_by = ev.handledBy;
  if (ev.speaker !== undefined) mapped.speaker = ev.speaker;
  if (ev.organizers !== undefined) mapped.organizers = ev.organizers;
  if (ev.poster !== undefined) mapped.poster = ev.poster;
  if (ev.photos !== undefined) mapped.photos = ev.photos;
  if (ev.galleryLink !== undefined) mapped.gallery_link = ev.galleryLink;
  if (ev.status !== undefined) mapped.status = ev.status;
  if (ev.manualStatus !== undefined) mapped.manual_status = ev.manualStatus;
  if (ev.isFeatured !== undefined) mapped.is_featured = ev.isFeatured;

  const { data, error } = await supabase
    .from("events")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function addEventRegistration(eventId: string, reg: any) {
  const { data, error } = await supabase
    .from("event_registrations")
    .insert({
      event_id: eventId,
      name: reg.name,
      department: reg.department,
      college: reg.college,
      year: Number(reg.year),
      mobile: reg.mobile,
      email: reg.email.toLowerCase().trim()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getEventRegistrations(eventId: string) {
  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("registered_at", { ascending: false });
  if (error) throw error;
  return data.map(item => ({
    ...item,
    registeredAt: item.registered_at
  }));
}
