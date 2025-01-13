import { FC, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, getVenueInfo, generateGptResponse, useAction, createReservation } from "wasp/client/operations";
import { WeekViewCalendar } from "./calendar/WeekViewCalendar";
import { useToast } from "../client/toast";
import { useCurrentDate } from './calendar/hooks/use-current-date';
import { isValid } from "date-fns";
import { parseISO } from "date-fns";

const useVenueQuery = (venueId: string, selectedDate: Date) => {
  const [result, setResult] = useState<any>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('selected_date')) {
      const urlSelectedDate = parseISO(searchParams.get('selected_date') ?? '')
      if (isValid(urlSelectedDate)) {
        getVenueInfo({ venueId, selectedDate: urlSelectedDate }).then(setResult);
      }
    }
  }, [searchParams, venueId, selectedDate]);

  return { result }
}

const VenuePage: FC = () => {
  const { venueId } = useParams();
  // broken because using hook twice instead of once
  const { selectedDate } = useCurrentDate();

  if (!venueId) {
    return <div>Venue not found</div>;
  }

  const { result: data } = useVenueQuery(venueId, selectedDate);


  // useEffect(() => {
  //   console.log('refetching', selectedDate);
  //   getVenueInfo({ venueId, selectedDate });
  // }, [selectedDate]);

  const venue = data;

  if (!venue) {
    return <div>Venue not found</div>;
  }

  return <div className="h-full">
    <WeekViewCalendar venue={venue} />
    <GptSection spaceId={venue.spaces[0].id} />
  </div>
};

export const GptSection: FC<{ spaceId: string }> = ({ spaceId }) => {

  const [message, setMessage] = useState('');

  const toast = useToast();


  return <div className="bg-gray-100 border-t border-gray-200 w-screen overflow-hidden px-6 sticky bottom-0 left-0 -mx-8">
    <form className="my-4 flex w-full justify-center"
      onSubmit={async (e) => {
        e.preventDefault();

        const response = await generateGptResponse({
          message
        })
        const result = JSON.parse(response);

        await createReservation({
          spaceId: spaceId,
          startTime: result.start,
          endTime: result.end,
          description: result.description
        })

        toast({ title: "Reservation created", duration: 10000 })
      }}
    >
      <div className="w-full">
        <input
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          type="search"
          placeholder="Tell me what you want to do"
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        />
      </div>
      <button
        type="submit"
        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
      >
        Chat
      </button>
    </form>
  </div>
}

export default VenuePage;
