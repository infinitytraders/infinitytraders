async function testNominatim() {
  try {
    console.log("Testing Nominatim API search call...");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=zawr%20industries&addressdetails=1&countrycodes=in&limit=5`,
      {
        headers: {
          'User-Agent': 'InfinityTraders/1.0 (contact@infinitytraders.shop)',
        },
      }
    );
    console.log("Response Status:", res.status);
    if (!res.ok) {
      console.error("Fetch failed!");
      return;
    }
    const data = await res.json();
    console.log("Suggestions returned count:", data.length);
    if (data.length > 0) {
      console.log("First suggestion display name:", data[0].display_name);
    } else {
      console.log("No suggestions found.");
    }
  } catch (err) {
    console.error("Error executing fetch:", err);
  }
}

testNominatim();
