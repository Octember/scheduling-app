import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getVenueInfo } from "wasp/client/operations";
import { useSelectedDate } from "./date-provider";
import { useQuery } from "@tanstack/react-query";
import { getUnavailabilityBlocks } from './availability-utils';

const useScheduleQuery = (venueId: string) => {
  const { selectedDate } = useSelectedDate();

  const { data: venue, refetch } = useQuery(
    [getVenueInfo, venueId, selectedDate],
    () =>
      getVenueInfo({
        venueId,
        selectedDate,
      }),
  );

  return {
    result: venue || null,
    refresh: () => {
      refetch();
    },
  };
};

export const ScheduleQueryContext = createContext<{
  venue: NonNullable<Awaited<ReturnType<typeof getVenueInfo>>>;
  unavailabileBlocks: {
    id: string;
    startTimeMinutes: number;
    endTimeMinutes: number;
  }[];
  refresh: () => void;
}>({ venue: null, unavailabileBlocks: [], refresh: () => { } });

export const ScheduleQueryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { venueId } = useParams();
  if (!venueId) {
    return <div>Venue not found</div>;
  }

  // Cache to avoid a flicker when the venue is loading
  const lastVenue = useRef<NonNullable<Awaited<ReturnType<typeof getVenueInfo>>> | null>(null);
  const { result: venue, refresh } = useScheduleQuery(venueId);

  if (venue) {
    lastVenue.current = venue;
  }

  const venueToUse = lastVenue.current || venue;

  const unavailabileBlocks = venueToUse ? getUnavailabilityBlocks(venueToUse) : [];

  if (!venueToUse) {
    return <div>Venue not found</div>;
  }

  return (
    <ScheduleQueryContext.Provider value={{ venue: venueToUse, unavailabileBlocks, refresh }}>
      {children}
    </ScheduleQueryContext.Provider>
  );
};

export const useScheduleContext = () => {
  return useContext(ScheduleQueryContext);
};
