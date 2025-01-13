import React, { FC, useRef } from "react";
import { Reservation, Space, Venue } from "wasp/entities";

import { CalendarHeader } from "./calendar-header";
import { timeLabels } from "./constants";
import { MinutesPerSlot, PixelsPerSlot } from './reservations/constants';
import { ReservationsSection } from "./reservations/reservation-section";

export interface WeekViewCalendarProps {
  venue: Venue & { spaces: (Space & { reservations: Reservation[] })[] };
}

export const WeekViewCalendar: FC<WeekViewCalendarProps> = ({ venue }) => {

  const containerOffset = useRef(null);
  const spaceIds = venue.spaces.map((space) => space.id);

  return (
    <div className="flex h-full flex-col">
      <CalendarHeader venue={venue} />

      <div className="isolate flex flex-auto flex-col overflow-auto bg-white">
        <div
          style={{ width: "165%" }}
          className="flex max-w-full flex-none flex-col"
        >
          <div className="flex flex-auto">
            <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Vertical lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid-rows-1 divide-x divide-gray-100 grid sm:pr-8"
                style={{
                  gridTemplateColumns: `repeat(${venue.spaces.length}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: venue.spaces.length + 1 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className={`col-start-${index + 1} row-span-full}`}
                    />
                  )
                )}
              </div>

              {/* Horizontal lines */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid"
                style={{
                  gridTemplateRows: `2rem repeat(${timeLabels.length * (60 / MinutesPerSlot)}, ${PixelsPerSlot}px)`,
                }}
              >
                <div
                  ref={containerOffset}
                  className="border-b border-gray-200"
                />

                {timeLabels.map((label, index) => (
                  <React.Fragment key={index}>
                    <div className="row-span-1 border-b border-gray-200">
                      <div className="sticky left-0 z-20 -ml-14 w-14 pr-2 -my-2.5 text-right text-xs/5 text-gray-400">
                        {label}
                      </div>
                    </div>
                    {/* 30min line */}
                    {Array.from({ length: (60 / MinutesPerSlot) - 1 }).map((_, index) => (
                      <div key={index} className="row-span-1 border-b border-gray-200"></div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              {/* Events */}
              <ReservationsSection venue={venue} spaceIds={spaceIds} />
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};
