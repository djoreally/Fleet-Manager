import React, { useState } from 'react';
import type { Vehicle } from '../types';
import { decodeVin } from '../services/nhtsaService';
import { WandIcon } from './icons/WandIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface EditVehicleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSave: (updatedData: Omit<Vehicle, 'id' | 'updatedAt'>) => Promise<void>;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ vehicle, onClose, onSave }) => {
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState<number | ''>(vehicle.year);
  const [mileage, setMileage] = useState<number | ''>(vehicle.mileage);
  const [vin, setVin] = useState(vehicle.vin || '');
  const [licensePlate, setLicensePlate] = useState(vehicle.licensePlate || '');
  const [oilFilter, setOilFilter] = useState(vehicle.oilFilterPartNumber || '');
  const [airFilter, setAirFilter] = useState(vehicle.airFilterPartNumber || '');
  const [cabinAirFilter, setCabinAirFilter] = useState(vehicle.cabinAirFilterPartNumber || '');
  const [fuelFilter, setFuelFilter] = useState(vehicle.fuelFilterPartNumber || '');
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
      await onSave({
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
      });
      onClose();
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      alert("Failed to update vehicle. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-surface-glass backdrop-blur-md rounded-lg shadow-xl border border-line animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Vehicle</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="edit-vin" className="block text-sm font-medium text-text-secondary">VIN</label>
                <div className="relative mt-1">
                    <input type="text" id="edit-vin" value={vin} onChange={e => setVin(e.target.value.toUpperCase())} required maxLength={17} className="block w-full input pr-28"/>
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
              <label htmlFor="edit-make" className="block text-sm font-medium text-text-secondary">Make</label>
              <input type="text" id="edit-make" value={make} onChange={e => setMake(e.target.value)} required className="mt-1 block w-full input"/>
            </div>
            <div>
              <label htmlFor="edit-model" className="block text-sm font-medium text-text-secondary">Model</label>
              <input type="text" id="edit-model" value={model} onChange={e => setModel(e.target.value)} required className="mt-1 block w-full input"/>
            </div>
            <div>
              <label htmlFor="edit-year" className="block text-sm font-medium text-text-secondary">Year</label>
              <input type="number" id="edit-year" value={year} onChange={e => setYear(Number(e.target.value))} min="1900" max="2100" required className="mt-1 block w-full input"/>
            </div>
            <div>
              <label htmlFor="edit-mileage" className="block text-sm font-medium text-text-secondary">Mileage</label>
              <input type="number" id="edit-mileage" value={mileage} onChange={e => setMileage(Number(e.target.value))} required className="mt-1 block w-full input"/>
            </div>
            <div>
                <label htmlFor="edit-license-plate" className="block text-sm font-medium text-text-secondary">License Plate</label>
                <input type="text" id="edit-license-plate" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required className="mt-1 block w-full input"/>
            </div>
            <div className="sm:col-span-2 pt-4 mt-4 border-t border-line">
                <h4 className="text-md font-medium text-text-secondary mb-2">Service Parts (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="edit-oilFilter" className="block text-sm font-medium text-text-secondary">Oil Filter P/N</label>
                        <input type="text" id="edit-oilFilter" value={oilFilter} onChange={e => setOilFilter(e.target.value)} className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label htmlFor="edit-airFilter" className="block text-sm font-medium text-text-secondary">Air Filter P/N</label>
                        <input type="text" id="edit-airFilter" value={airFilter} onChange={e => setAirFilter(e.target.value)} className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label htmlFor="edit-cabinAirFilter" className="block text-sm font-medium text-text-secondary">Cabin Air Filter P/N</label>
                        <input type="text" id="edit-cabinAirFilter" value={cabinAirFilter} onChange={e => setCabinAirFilter(e.target.value)} className="mt-1 block w-full input"/>
                    </div>
                    <div>
                        <label htmlFor="edit-fuelFilter" className="block text-sm font-medium text-text-secondary">Fuel Filter P/N</label>
                        <input type="text" id="edit-fuelFilter" value={fuelFilter} onChange={e => setFuelFilter(e.target.value)} className="mt-1 block w-full input"/>
                    </div>
                </div>
            </div>
            <div className="sm:col-span-2 flex flex-col sm:flex-row-reverse gap-3 mt-2">
                <button type="submit" disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-text-inverted bg-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 w-full flex justify-center py-2 px-4 border border-line rounded-md shadow-sm text-sm font-medium text-text-secondary bg-surface hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50">
                    Cancel
                </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};