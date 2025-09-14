import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";

// Load environment variables
config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface RouteData {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  operatingDays: string[];
  schedule: string[];
  specialNotes?: string;
}

interface LocationData {
  locationId: string;
  name: string;
  fullName: string;
  type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Routes data from your page.tsx
const routesData: RouteData[] = [
  {
    routeId: "R001",
    routeName: "LRT Bukit Jalil to APU",
    origin: "LRT - BUKIT JALIL",
    destination: "APU",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: [
      "07:30",
      "07:40",
      "07:45",
      "07:50",
      "07:55",
      "08:00",
      "08:05",
      "08:15",
      "08:20",
      "08:25",
      "08:30",
      "08:35",
      "08:45",
      "09:00",
      "09:10",
      "09:20",
      "09:30",
      "09:50",
      "10:00",
      "10:05",
      "10:10",
      "10:15",
      "10:30",
      "10:35",
      "10:45",
      "11:00",
      "11:05",
      "11:10",
      "11:25",
      "11:40",
      "12:10",
      "12:30",
      "12:45",
      "13:00",
      "13:15",
      "13:20",
      "13:25",
      "13:40",
      "14:10",
      "14:25",
      "14:40",
      "15:05",
      "15:20",
      "15:40",
      "15:55",
      "16:10",
      "16:25",
      "17:10",
      "17:20",
      "17:30",
      "18:20",
    ],
  },
  {
    routeId: "R002",
    routeName: "APU to LRT Bukit Jalil",
    origin: "APU",
    destination: "LRT - BUKIT JALIL",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: [
      "10:35",
      "10:45",
      "11:30",
      "11:50",
      "12:10",
      "12:35",
      "12:50",
      "13:05",
      "13:10",
      "13:15",
      "13:30",
      "14:00",
      "14:15",
      "14:30",
      "14:45",
      "15:10",
      "15:20",
      "15:30",
      "15:45",
      "15:50",
      "16:00",
      "16:15",
      "16:30",
      "16:45",
      "16:50",
      "17:00",
      "17:10",
      "17:20",
      "17:30",
      "17:40",
      "18:00",
      "18:10",
      "18:15",
      "18:30",
      "18:40",
      "18:55",
      "19:15",
      "20:45",
      "21:45",
    ],
  },
  {
    routeId: "R003",
    routeName: "M Vertica to APU",
    origin: "M VERTICA",
    destination: "APU",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: ["07:45", "09:45", "11:15", "14:30"],
  },
  {
    routeId: "R004",
    routeName: "APU to M Vertica",
    origin: "APU",
    destination: "M VERTICA",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: ["14:00", "15:00", "16:45", "17:45", "18:45"],
  },
  {
    routeId: "R005",
    routeName: "City of Green to APU",
    origin: "CITY OF GREEN",
    destination: "APU",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: [
      "07:45",
      "08:20",
      "09:00",
      "09:45",
      "11:00",
      "12:00",
      "13:00",
      "15:00",
    ],
  },
  {
    routeId: "R006",
    routeName: "APU to City of Green",
    origin: "APU",
    destination: "CITY OF GREEN",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: [
      "10:35",
      "11:30",
      "12:30",
      "14:30",
      "15:30",
      "16:00",
      "16:30",
      "17:40",
      "18:00",
      "18:40",
      "19:00",
      "20:45",
      "21:45",
    ],
  },
  {
    routeId: "R007",
    routeName: "Bloomsvale to APU",
    origin: "BLOOMSVALE",
    destination: "APU",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: ["07:45", "10:15"],
  },
  {
    routeId: "R008",
    routeName: "APU to Bloomsvale",
    origin: "APU",
    destination: "BLOOMSVALE",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: ["15:30", "18:30"],
  },
  {
    routeId: "R009",
    routeName: "Fortune Park to APU",
    origin: "FORTUNE PARK",
    destination: "APU",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: [
      "08:00",
      "08:15",
      "09:00",
      "09:30",
      "10:00",
      "10:15",
      "11:00",
      "11:30",
      "12:00",
      "13:30",
      "14:40",
      "15:40",
      "16:20",
      "16:40",
      "17:40",
      "18:10",
    ],
  },
  {
    routeId: "R010",
    routeName: "APU to Fortune Park",
    origin: "APU",
    destination: "FORTUNE PARK",
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    schedule: [
      "10:30",
      "11:25",
      "13:00",
      "14:10",
      "15:00",
      "15:50",
      "16:20",
      "17:00",
      "17:40",
      "18:00",
      "18:40",
      "19:15",
    ],
  },
  {
    routeId: "R011",
    routeName: "APU to Mosque (Friday Only)",
    origin: "APU",
    destination: "MOSQUE",
    operatingDays: ["Friday"],
    schedule: ["12:30"],
    specialNotes: "Friday prayer service only",
  },
  {
    routeId: "R012",
    routeName: "Mosque to APU (Friday Only)",
    origin: "MOSQUE",
    destination: "APU",
    operatingDays: ["Friday"],
    schedule: ["13:30"],
    specialNotes: "Friday prayer service only",
  },
];

// Locations data
const locationsData: LocationData[] = [
  {
    locationId: "L001",
    name: "APU",
    fullName: "Asia Pacific University",
    type: "university",
    coordinates: { latitude: 3.0474, longitude: 101.7002 },
  },
  {
    locationId: "L002",
    name: "LRT - BUKIT JALIL",
    fullName: "LRT Bukit Jalil Station",
    type: "transport_hub",
    coordinates: { latitude: 3.0365, longitude: 101.7011 },
  },
  {
    locationId: "L003",
    name: "M VERTICA",
    fullName: "M Vertica Residence",
    type: "residential",
    coordinates: { latitude: 3.052, longitude: 101.705 },
  },
  {
    locationId: "L004",
    name: "CITY OF GREEN",
    fullName: "City of Green Residence",
    type: "residential",
    coordinates: { latitude: 3.044, longitude: 101.698 },
  },
  {
    locationId: "L005",
    name: "BLOOMSVALE",
    fullName: "Bloomsvale Residence",
    type: "residential",
    coordinates: { latitude: 3.04, longitude: 101.71 },
  },
  {
    locationId: "L006",
    name: "FORTUNE PARK",
    fullName: "Fortune Park Residence",
    type: "residential",
    coordinates: { latitude: 3.05, longitude: 101.695 },
  },
  {
    locationId: "L007",
    name: "MOSQUE",
    fullName: "Local Mosque",
    type: "religious",
    coordinates: { latitude: 3.046, longitude: 101.702 },
  },
];

async function migrateRoutesToFirestore() {
  try {
    console.log("🚀 Starting migration of routes to Firestore...");

    // Migrate routes
    const routesCollection = collection(db, "routes");
    for (const route of routesData) {
      try {
        const routeData = {
          ...route,
          isActive: true,
          createdAt: Timestamp.now(),
        };

        // Validate the data before sending
        if (!route.routeId || !route.routeName) {
          console.error(`❌ Invalid route data: ${JSON.stringify(route)}`);
          continue;
        }

        await addDoc(routesCollection, routeData);
        console.log(`✅ Migrated route: ${route.routeName}`);
      } catch (routeError) {
        console.error(
          `❌ Error migrating route ${route.routeName}:`,
          routeError,
        );
        // Continue with other routes
      }
    }

    console.log(
      `✅ Successfully migrated ${routesData.length} routes to Firestore`,
    );

    // Migrate locations
    const locationsCollection = collection(db, "locations");
    for (const location of locationsData) {
      try {
        // Validate the data before sending
        if (!location.locationId || !location.name) {
          console.error(
            `❌ Invalid location data: ${JSON.stringify(location)}`,
          );
          continue;
        }

        await addDoc(locationsCollection, location);
        console.log(`✅ Migrated location: ${location.fullName}`);
      } catch (locationError) {
        console.error(
          `❌ Error migrating location ${location.fullName}:`,
          locationError,
        );
        // Continue with other locations
      }
    }

    console.log(
      `✅ Successfully migrated ${locationsData.length} locations to Firestore`,
    );
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
void migrateRoutesToFirestore();
