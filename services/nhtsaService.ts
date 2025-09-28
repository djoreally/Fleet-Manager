export interface DecodedVin {
    make: string;
    model: string;
    year: number;
}

/**
 * Decodes a Vehicle Identification Number (VIN) using the NHTSA vPIC API.
 * @param vin The 17-character VIN to decode.
 * @returns A promise that resolves to an object with make, model, and year.
 */
export async function decodeVin(vin: string): Promise<DecodedVin> {
    if (vin.length !== 17) {
        throw new Error("VIN must be 17 characters long.");
    }

    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`NHTSA API responded with status: ${response.status}`);
        }
        const data = await response.json();

        if (data.Results && data.Results.length > 0) {
            const result = data.Results[0];

            // NHTSA API returns ErrorCode "0" for success, but data can still be invalid.
            if (result.ErrorCode && result.ErrorCode !== "0") {
                if (result.ErrorText && result.ErrorText !== "No Error") {
                   throw new Error(`NHTSA: ${result.ErrorText}`);
                }
            }
            
            const make = result.Make;
            const model = result.Model;
            const year = result.ModelYear;

            if (make && model && year) {
                return {
                    make,
                    model,
                    year: Number(year),
                };
            }
        }
        throw new Error("Could not decode VIN. Please check if it's correct and try again.");

    } catch (error) {
        console.error("VIN decoding failed:", error);
        if (error instanceof Error) {
            throw error; // Re-throw the original error to be caught by the caller
        }
        throw new Error("An unknown error occurred during VIN decoding.");
    }
}
