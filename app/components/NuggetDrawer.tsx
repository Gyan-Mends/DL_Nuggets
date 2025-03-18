import { Chip, Button } from "@nextui-org/react";
import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { MdBookmarkAdd, MdBookmarkRemove } from "react-icons/md";
import axios from "axios";

interface Keyword {
  keyword: {
    value: string;
  };
}

interface AreaOfLaw {
  area_of_law: {
    id: number;
    display_name: string;
  };
}

export interface Nugget {
  id: number;
  title: string;
  principle: string;
  headnote?: string;
  quote?: string;
  dl_citation_no?: string;
  citation_no?: string;
  year?: number;
  judge_title?: string;
  page_number?: number;
  area_of_laws?: AreaOfLaw[];
  keywords?: Keyword[];
  judge?: {
    id: number;
    fullname: string;
  };
  status?: string;
  file_url?: string | null;
  slug?: string;
  courts?: string;
  other_citations?: string | null;
  is_bookmarked?: boolean;
}

interface NuggetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nugget: Nugget | null;
  parentName?: string;
  parentType?: "judge" | "court" | "area";
  onBookmarkChange?: () => void;
  baseUrl?: string;
}

const NuggetDrawer = ({
  isOpen,
  onClose,
  nugget,
  parentName,
  parentType,
  onBookmarkChange,
  baseUrl,
}: NuggetDrawerProps) => {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isBookmarking, setIsBookmarking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (nugget) {
      setIsBookmarked(!!nugget.is_bookmarked);
    }
  }, [nugget]);

  if (!nugget) return null;

  const handleBookmarkToggle = async () => {
    if (!nugget || isBookmarking) return;

    setIsBookmarking(true);
    setErrorMessage(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("access_token");
      if (!token) {
        setErrorMessage("You must be logged in to bookmark nuggets");
        setIsBookmarking(false);
        return;
      }

      if (isBookmarked) {
        // Remove bookmark
        await axios.delete(`${baseUrl}/bookmark-nugget/${nugget.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Add bookmark
        await axios.post(
          `${baseUrl}/bookmark-nugget`,
          { nugget_id: nugget.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Toggle bookmark state
      setIsBookmarked(!isBookmarked);

      // Call the callback if provided to refresh parent component
      if (onBookmarkChange) {
        onBookmarkChange();
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setErrorMessage("Failed to update bookmark. Please try again.");
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div
      className={`fixed z-50 right-0 top-0 h-full w-[400px] bg-white shadow-lg transition-transform duration-300 border-l overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Close Button and Bookmark */}
        <div className="flex justify-between w-full">
          <Button
            isIconOnly
            variant="light"
            color={isBookmarked ? "danger" : "primary"}
            aria-label={
              isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
            }
            isLoading={isBookmarking}
            onClick={handleBookmarkToggle}
          >
            {isBookmarked ? (
              <MdBookmarkRemove className="text-xl" />
            ) : (
              <MdBookmarkAdd className="text-xl" />
            )}
          </Button>
          <button
            className="text-gray-600 hover:text-primary"
            onClick={onClose}
          >
            ✕ Close
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {/* Case Information */}
        <div className="mt-2">
          <span className="bg-blue-50 text-blue-800 px-2 py-1 text-xs rounded-full">
            {nugget.status || "Published"}
          </span>
        </div>

        {/* Citation */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm font-semibold">
            {nugget.citation_no || nugget.dl_citation_no}
          </span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
            {nugget.year}
          </span>
        </div>

        {/* Quoted From Section */}
        <div className="mt-4">
          <p className="text-gray-700 font-semibold">Quoted from</p>
          <p className="text-gray-500 text-xs italic">
            Tap title below for full case
          </p>
        </div>

        {/* Title with Link */}
        <div className="mt-2">
          <Link
            to={`/nuggets/${nugget.id}`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {nugget.title}
          </Link>

          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span className="font-medium">
              {nugget.citation_no || nugget.dl_citation_no}
            </span>
            {nugget.page_number && (
              <span className="ml-2">at page {nugget.page_number}</span>
            )}
          </div>
        </div>

        {/* Judge Information */}
        {nugget.judge && (
          <div className="mt-3">
            <Link
              to={`/nuggets/${nugget.id}`}
              className="font-semibold hover:underline"
            >
              - {nugget.judge.fullname} {nugget.judge_title}
            </Link>
          </div>
        )}

        <div className="border-b border-gray-300 my-4"></div>

        {/* Headnote */}
        <h2 className="font-bold text-xl">{nugget.headnote || nugget.title}</h2>

        {/* Quote */}
        {nugget.quote && (
          <div className="mt-4 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
            <p className="text-sm text-gray-500 font-semibold mb-1">QUOTE:</p>
            <p className="text-sm italic text-gray-700">{nugget.quote}</p>
          </div>
        )}

        {/* Principle */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 font-semibold">PRINCIPLE:</p>
          <p className="text-gray-700 mt-1">{nugget.principle}</p>
        </div>

        {/* Keywords */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 font-semibold mb-2">KEYWORDS:</p>
          <div className="flex gap-2 flex-wrap">
            {nugget.keywords?.map((keywordObj, index) => (
              <Chip
                key={index}
                size="sm"
                variant="flat"
                color="secondary"
                className="bg-gray-200 text-gray-700"
              >
                {keywordObj.keyword.value}
              </Chip>
            ))}
          </div>
        </div>

        {/* Area of Law */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 font-semibold mb-2">
            AREA OF LAW:
          </p>
          <div className="flex gap-2 flex-wrap">
            {nugget.area_of_laws?.map((areaObj, index) => (
              <Chip
                key={index}
                size="sm"
                variant="flat"
                color="primary"
                className="bg-primary/10 text-primary"
              >
                {areaObj.area_of_law.display_name}
              </Chip>
            ))}
          </div>
        </div>

        {/* Additional Metadata */}
        <div className="mt-6 grid grid-cols-2 gap-4 pb-5">
          <div>
            <p className="text-sm text-gray-500">Judge</p>
            <p className="font-semibold">
              {nugget.judge?.fullname || "Not specified"}
            </p>
            {nugget.judge_title && (
              <p className="text-xs text-gray-500">{nugget.judge_title}</p>
            )}
          </div>

          {parentType === "court" && parentName && (
            <div>
              <p className="text-sm text-gray-500">Court</p>
              <p className="font-semibold">{parentName}</p>
            </div>
          )}

          {nugget.page_number && (
            <div>
              <p className="text-sm text-gray-500">Page Number</p>
              <p className="font-semibold">{nugget.page_number}</p>
            </div>
          )}

          {nugget.other_citations && (
            <div>
              <p className="text-sm text-gray-500">Other Citations</p>
              <p className="font-semibold">{nugget.other_citations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuggetDrawer;
