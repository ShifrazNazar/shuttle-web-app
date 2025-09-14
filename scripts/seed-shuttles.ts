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

interface ShuttleData {
  licensePlate: string;
  capacity: number;
  model: string;
  year: number;
  color: string;
  status: "active" | "inactive" | "maintenance";
  driverId?: string;
}

// Shuttle fleet data
const shuttlesData: ShuttleData[] = [
  {
    licensePlate: "ABC1234",
    capacity: 25,
    model: "Toyota Hiace",
    year: 2022,
    color: "White",
    status: "active",
  },
  {
    licensePlate: "DEF5678",
    capacity: 30,
    model: "Isuzu NQR",
    year: 2021,
    color: "Blue",
    status: "active",
  },
  {
    licensePlate: "GHI9012",
    capacity: 20,
    model: "Ford Transit",
    year: 2023,
    color: "Red",
    status: "active",
  },
  {
    licensePlate: "JKL3456",
    capacity: 25,
    model: "Mercedes Sprinter",
    year: 2020,
    color: "Silver",
    status: "maintenance",
  },
  {
    licensePlate: "MNO7890",
    capacity: 30,
    model: "Toyota Coaster",
    year: 2022,
    color: "White",
    status: "active",
  },
  {
    licensePlate: "PQR1234",
    capacity: 20,
    model: "Nissan Urvan",
    year: 2021,
    color: "Green",
    status: "inactive",
  },
  {
    licensePlate: "STU5678",
    capacity: 25,
    model: "Hyundai County",
    year: 2023,
    color: "Blue",
    status: "active",
  },
  {
    licensePlate: "VWX9012",
    capacity: 30,
    model: "Isuzu NPR",
    year: 2020,
    color: "White",
    status: "active",
  },
  {
    licensePlate: "YZA3456",
    capacity: 20,
    model: "Ford Transit Custom",
    year: 2022,
    color: "Red",
    status: "maintenance",
  },
  {
    licensePlate: "BCD7890",
    capacity: 25,
    model: "Toyota Hiace Commuter",
    year: 2021,
    color: "Silver",
    status: "active",
  },
  {
    licensePlate: "EFG1234",
    capacity: 30,
    model: "Mercedes Sprinter 316",
    year: 2023,
    color: "Blue",
    status: "active",
  },
  {
    licensePlate: "HIJ5678",
    capacity: 20,
    model: "Nissan Civilian",
    year: 2020,
    color: "White",
    status: "inactive",
  },
  {
    licensePlate: "KLM9012",
    capacity: 25,
    model: "Hyundai Universe",
    year: 2022,
    color: "Green",
    status: "active",
  },
  {
    licensePlate: "NOP3456",
    capacity: 30,
    model: "Isuzu Giga",
    year: 2021,
    color: "Red",
    status: "maintenance",
  },
  {
    licensePlate: "QRS7890",
    capacity: 20,
    model: "Ford Transit 350",
    year: 2023,
    color: "Silver",
    status: "active",
  },
];

async function seedShuttlesToFirestore() {
  try {
    console.log("🚀 Starting shuttle seeding to Firestore...");

    // Seed shuttles
    const shuttlesCollection = collection(db, "shuttles");
    let successCount = 0;
    let errorCount = 0;

    for (const shuttle of shuttlesData) {
      try {
        const shuttleData = {
          ...shuttle,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // Validate the data before sending
        if (!shuttle.licensePlate || !shuttle.model || !shuttle.capacity) {
          console.error(`❌ Invalid shuttle data: ${JSON.stringify(shuttle)}`);
          errorCount++;
          continue;
        }

        await addDoc(shuttlesCollection, shuttleData);
        console.log(
          `✅ Seeded shuttle: ${shuttle.licensePlate} (${shuttle.model})`,
        );
        successCount++;
      } catch (shuttleError) {
        console.error(
          `❌ Error seeding shuttle ${shuttle.licensePlate}:`,
          shuttleError,
        );
        errorCount++;
        // Continue with other shuttles
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`✅ Successfully seeded: ${successCount} shuttles`);
    console.log(`❌ Failed to seed: ${errorCount} shuttles`);
    console.log(`📝 Total processed: ${shuttlesData.length} shuttles`);

    if (successCount > 0) {
      console.log("\n🎉 Shuttle seeding completed successfully!");
      console.log(
        "💡 You can now use the shuttle management system in the admin panel.",
      );
    } else {
      console.log(
        "\n⚠️ No shuttles were seeded. Please check the errors above.",
      );
    }
  } catch (error) {
    console.error("❌ Error during shuttle seeding:", error);
    process.exit(1);
  }
}

// Run the seeding
void seedShuttlesToFirestore();
