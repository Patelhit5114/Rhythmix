import { backendUrl } from "./config";

export const makeUnauthenticatedPOSTRequest = async (route, body) => {
  // console.log("hello");
  const response = await fetch(backendUrl + route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    // mode : 'no-cors',
    body: JSON.stringify(body),
  });
  const formattedResponse = await response.json();
  return formattedResponse;
};

// const BASE_URL = "http://localhost:8080";

// export const makeAuthenticatedPOSTRequest = async (route, body) => {
//   const token = localStorage.getItem("token");
//   const response = await fetch(BASE_URL + route, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + token,
//     },
//     body: JSON.stringify(body),
//   });
//   return response.json();
// };

// OLD CODE FOR POST
// export const makeAuthenticatedPOSTRequest = async (route, body) => {
//   const token = getToken();
  
//   try {
//     const response = await fetch(backendUrl + route, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(body),
//     });
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const formattedResponse = await response.json();
//     return formattedResponse;
//   } catch (error) {
//     console.error("Request failed:", error);
//     return { err: "Network error or invalid response" };
//   }
// };

export const makeAuthenticatedPOSTRequest = async (route, body) => {
  try {
    const res = await fetch("http://localhost:8080" + route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Server returned non-JSON response:", text);
      return { err: "Invalid server response", raw: text };
    }
  } catch (error) {
    console.error("Request failed:", error);
    return { err: "Network error", details: error.message };
  }
};

// OLD CODE FOR GET
export const makeAuthenticatedGETRequest = async (route) => {
  const token = getToken();
  const response = await fetch(backendUrl + route, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const formattedResponse = await response.json();
  return formattedResponse;
};

// FOR LOGOUT
export const makeAuthenticatedLogoutRequest = async () => {
  const token = getToken();
  const response = await fetch(backendUrl + "/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const formattedResponse = await response.json();
  return formattedResponse;
};

//get token from the cookie
const getToken = () => {
  const accessToken = document.cookie.replace(
    /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
  return accessToken;
};
