import React, { useState } from 'react';
import { apiFetch } from '../services/api';
import { decodeVin } from '../services/nhtsaService';
import { WandIcon } from './icons/WandIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { Vehicle } from '../types';

interface AddVehicleFormProps {
    onVehicleAdded?: (vehicle: Vehicle) => void;
    title?: string;
    submitButtonText?: string;
}

export const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ onVehicleAdded, title, submitButtonText }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [mileage, setMileage] = useState<number | ''>('');
  const [vin, setVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [oilFilter, setOilFilter] = useState('');
  const [airFilter, setAirFilter] = useState('');
  const [cabinAirFilter, setCabinAirFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleDecodeVin = async () => {
    if (vin.length !== 17) {
        alert("Please enter a valid 17-character VIN.");
        return;
    }
    setIsDecoding(true);
    try {
        const decodedData = await decodeVin(vin);
        setMake(decodedData.make);
        setModel(decodedData.model);
        setYear(decodedData.year);
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(`Failed to decode VIN: ${message}`);
    } finally {
        setIsDecoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !year || !mileage || !vin || !licensePlate) return;
    
    setIsSubmitting(true);
    try {
      const vehicleData = {
        make,
        model,
        year: Number(year),
        mileage: Number(mileage),
        vin,
        licensePlate,
        oilFilterPartNumber: oilFilter,
        airFilterPartNumber: airFilter,
        cabinAirFilterPartNumber: cabinAirFilter,
        fuelFilterPartNumber: fuelFilter,
      };

      const newVehicle = await apiFetch('create-vehicle', {
        method: 'POST',
        body: JSON.stringify(vehicleData),
      });
      
      if (onVehicleAdded) {
        onVehicleAdded(newVehicle);
      } else {
        // Reset form only if it's not part of a larger flow
        setMake('');
        setModel('');
        setYear('');
        setMileage('');
        setVin('');
        setLicensePlate('');
        setOilFilter('');
        setAirFilter('');
        setCabinAirFilter('');
        setFuelFilter('');
      }

    } catch (error) {
      console.error("Failed to add vehicle:", error);
      alert("Failed to add vehicle. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      { title !== "" && <h3 className="text-lg font-semibold text-text-primary mb-4">{title || 'Add New Vehicle'}</h3> }
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-text-secondary">VIN</label>
          <div className="relative mt-1">
            <input type="text" id="vin" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} required placeholder="17-character VIN" maxLength={17} className="block w-full input pr-28"/>
            <button
                type="button"
                onClick={handleDecodeVin}
                disabled={isDecoding || vin.length !== 17}
                className="absolute inset-y-0 right-1.5 my-auto h-8 px-3 flex items-center gap-1.5 text-xs font-semibold rounded-md text-accent bg-accent/20 hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decode VIN"
            >
                {isDecoding ? (
                    <SpinnerIcon className="w-4 h-4 animate-spin-slow" />
                ) : (
                    <WandIcon className="w-4 h-4" />
                )}
                {isDecoding ? 'Decoding...' : 'Decode'}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="make" className="block text-sm font-medium text-text-secondary">Make</label>
          <input type="text" id="make" value={make} onChange={e => setMake(e.target.value)} required placeholder="e.g., Toyota" className="mt-1 block w-full input"/>
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-text-secondary">Model</label>
          <input type="text" id="model" value={model} onChange={e => setModel(e.target.value)} required placeholder="e.g., Camry" className="mt-1 block w-full input"/>
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-text-secondary">Year</label>
          <input type="number" id="year" value={year} onChange={e => setYear(Number(e.target.value))} min="1900" max="2100" required placeholder="e.g., 2021" className="mt-1 block w-full input"/>
        </div>
        <div>
          <label htmlFor="mileage" className="block text-sm font-medium text-text-secondary">Mileage</label>
          <input type="number" id="mileage" value={mileage} onChange={e => setMileage(Number(e.target.value))} required placeholder="e.g., 25000" className="mt-1 block w-full input"/>
        </div>
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-text-secondary">License Plate</label>
          <input type="text" id="licensePlate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required placeholder="e.g., ABC-123" className="mt-1 block w-full input"/>
        </div>

        <div className="sm:col-span-2 pt-4 mt-4 border-t border-line">
            <h4 className="text-md font-medium text-text-secondary mb-2">Service Parts (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="oilFilter" className="block text-sm font-medium text-text-secondary">Oil Filter P/N</label>
                  <input type="text" id="oilFilter" value={oilFilter} onChange={e => setOilFilter(e.target.value)} placeholder="e.g., PH3614" className="mt-1 block w-full input"/>
                </div>
                <div>
                  <label htmlFor="airFilter" className="block text-sm font-medium text-text-secondary">Air Filter P/N</label>
                  <input type="text" id="airFilter" value={airFilter} onChange={e => setAirFilter(e.target.value)} placeholder="e.g., CA8755" className="mt-1 block w-full input"/>
                </div>
                <div>
                  <label htmlFor="cabinAirFilter" className="block text-sm font-medium text-text-secondary">Cabin Air Filter P/N</label>
                  <input type="text" id="cabinAirFilter" value={cabinAirFilter} onChange={e => setCabinAirFilter(e.target.value)} placeholder="e.g., CF10285" className="mt-1 block w-full input"/>
                </div>
                <div>
                  <label htmlFor="fuelFilter" className="block text-sm font-medium text-text-secondary">Fuel Filter P/N</label>
                  <input type="text" id="fuelFilter" value={fuelFilter} onChange={e => setFuelFilter(e.target.value)} placeholder="e.g., G3727" className="mt-1 block w-full input"/>
                </div>
            </div>
        </div>

        <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? 'Adding...' : (submitButtonText || 'Add Vehicle')}
            </button>
        </div>
      </form>
    </>
  );
};