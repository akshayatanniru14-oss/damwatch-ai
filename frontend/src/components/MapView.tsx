import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Asset, Report } from '../types';

interface MapViewProps {
  assets: Asset[];
  reports: Report[];
}

const MapView: React.FC<MapViewProps> = ({ assets, reports }) => {
  const [position, setPosition] = useState<[number, number]>([20.5937, 78.9629]); // Default to India

  useEffect(() => {
    if (assets.length > 0) {
      const firstAsset = assets[0];
      setPosition([firstAsset.coordinates.lat, firstAsset.coordinates.lon]);
    }
  }, [assets]);

  return (
    <MapContainer center={position} zoom={5} className="h-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {assets.map(asset => (
        <Marker key={asset.name} position={[asset.coordinates.lat, asset.coordinates.lon]}>
          <Popup>
            <strong>{asset.name}</strong><br />
            Type: {asset.type}<br />
            State: {asset.state}
          </Popup>
        </Marker>
      ))}
      {reports.map(report => (
        <Marker key={report.id} position={[report.coordinates.lat, report.coordinates.lon]} icon={getSeverityIcon(report.severity)}>
          <Popup>
            <strong>Report ID: {report.id}</strong><br />
            Issue: {report.issue_detected}<br />
            Severity: {report.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

const getSeverityIcon = (severity: string) => {
  // Define your icon logic based on severity
  return null; // Placeholder for icon logic
};

export default MapView;