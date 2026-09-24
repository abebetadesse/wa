import { NextRequest, NextResponse } from "next/server";
import { getEthiopianLocationById } from "@/lib/location/ethiopiaLocations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> },
) {
  try {
    const { locationId } = await params;
    const location = getEthiopianLocationById(locationId);

    if (!location) {
      return NextResponse.json({
        success: false,
        error: `Location '${locationId}' was not found.`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Location lookup is temporarily unavailable.",
    }, { status: 503 });
  }
}
