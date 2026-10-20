import { getEthiopianLocationDataset } from "@/lib/location/ethiopiaLocations";
import LocationsClient from "./LocationsClient";

export default function LocationsPage() {
  return <LocationsClient allLocations={getEthiopianLocationDataset()} />;
}
