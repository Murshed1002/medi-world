import LocationOnIcon from "@mui/icons-material/LocationOn";

interface MapPreviewProps {
  mapImageUrl: string | undefined;
  latitude: number;
  longitude: number;
  locationName: string;
}

export default function MapPreview({
  mapImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuARvmOM8r7x0BoJIlgGtzyXoJsVfQhW8fdgk8mGFAmmSpSoNy-VCuYPatThAKMO3z-uduVrB5BQ184E7wiogDbLudyexIGxNi9-lFN_bxGl5bN_LLDwWG1U16Gy_2KlkVv0yyoVn7Hj7bCfe_-AJ4NKgKusR4k0xps_-tEZSWWhAgbu3vnO8_slEhaTUfkIez4K4tQC_yOpT23TlFD3wIobgyrwDZLFSlEl7BzMjJFB2TLyuo0gb7oXRaTtrs6dATcXyO5wVxWIfpY',
  latitude,
  longitude,
  locationName,
}: MapPreviewProps) {
  const onClick = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  };
  return (
    <div
      className={`aspect-video w-full overflow-hidden rounded-lg bg-gray-200 shadow-inner relative group cursor-pointer`}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${mapImageUrl})` }}
        aria-label={`Map for ${locationName}`}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
        <div className="bg-white/90 p-2 rounded-full shadow-lg">
          <LocationOnIcon className="text-red-500" />
        </div>
      </div>
    </div>
  );
}
