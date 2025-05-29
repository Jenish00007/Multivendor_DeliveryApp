import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Products from "../../components/Products/Products";
import NewRestaurantCard from "../../components/Main/FeaturedStores/NewRestaurantCard";

const baseUrl = 'https://6ammart-admin.6amtech.com'; // Backend API base URL

function SearchPage() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("Items"); // Default tab is 'Items'
  const moduleId = 1;

  const contentType = activeTab === 'Items' ? 'Items' : 'stores';

  const fetchSearchResults = async (text) => {
    if (text.trim() === "") {
      setSearchResults([]); // Clear results if search is empty
      return;
    }

    const itemUrl = `${baseUrl}/api/v1/items/search?name=${text}&category_id=102&type=all&offset=1&limit=50`;
    const storeUrl = `${baseUrl}/api/v1/stores/search?name=${text}&category_id=102&type=all&offset=1&limit=50`;

    try {
      const response = await fetch(activeTab === 'Items' ? itemUrl : storeUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          zoneId: '[1]',
          moduleId: '1',
        },
      });

      const json = await response.json();
if(activeTab === "Items"){

    if (json?.products && json?.products.length > 0) {
        // Format the data and update search results
        const formattedData = json.products;
        setSearchResults(formattedData);
      } else {
        setSearchResults([]); // No products found
        console.log('No products found or invalid response');
      }
    }else{
      if (json?.stores && json?.stores.length > 0) {
        setSearchResults(json?.stores);
      } else {
        setSearchResults([]);
        console.log('No stores found or invalid response');
      }
    }
  
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]); // Clear results on error
    }
  };

  // Handle search input changes
  const handleSearch = (text) => {
    setSearchText(text);
    fetchSearchResults(text); // Fetch data whenever text changes
  };

  // Render each search result item
  const renderItem = ({ item }) => (
    <View style={styles.personContainer}>
      {activeTab === "Items" ? (
        <Image source={{ uri: item.image_full_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar} />
      )}
      <View style={styles.personDetails}>
        <Text style={styles.personName}>{item.name}</Text>
        {activeTab === "Items" && <Text style={styles.personTagline}>${item.price}</Text>}
        {activeTab === "stores" && <Text style={styles.personTagline}>{item.location}</Text>}
      </View>
    </View>
  );

  // Display number of results
  const renderResultCount = () => {
    const count = searchResults.length;
    return (
      <Text style={styles.resultCount}>
        {count} {count === 1 ? 'result' : 'results'} found
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Back button and search bar */}
      <View style={styles.headerContainer}>
        <View style={styles.searchBarContainer}>
          <Icon name="search" size={22} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Search for ${activeTab.toLowerCase()}...`}
            placeholderTextColor="#999"
          />
          {searchText !== "" && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchText("");
                setSearchResults([]);
              }}
            >
              <Text style={styles.clearText}>✖</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results count */}
      {searchResults.length > 0 && renderResultCount()}

      {/* Custom tab selector */}
      <View style={styles.tabContainer}>
        {["Items", "stores"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => {
              setActiveTab(tab);
              setSearchResults([]); // Clear results when switching tabs
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      {contentType === 'Items' ? (
        <FlatList
        data={searchResults}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <Products 
        item={item}
         />}
        keyExtractor={(item) => item.id.toString()}
      />
      ) : (
        <FlatList
          horizontal={true}
          style={styles.storesList}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NewRestaurantCard {...item} />}
        />
      )}
      {/* Results list */}
      {/* <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()} // Make sure to use a valid unique key
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          searchText.trim() !== "" ? (
            <Text style={styles.noResults}>No results found</Text>
          ) : null
        }
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
    marginLeft: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 45,
  },
  clearButton: {
    padding: 5,
  },
  clearText: {
    fontSize: 16,
    color: "#999",
  },
  resultCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",  // Ensures the tabs are centered
    alignItems: "center",  
  },
  tabButton: {
    paddingVertical: 15,
    marginRight: 30,
    position: "relative",
    alignItems: "center",   
  },
  activeTabButton: {
    // Active styling handled by the indicator
  },
  tabText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    fontSize: 16,
    color:'#F16122',
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor:'#F16122',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  personContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  personDetails: {
    marginLeft: 15,
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  personTagline: {
    fontSize: 14,
    color:  "#777",
    fontWeight: "normal",
  },
  noResults: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 40,
  },
});

export default SearchPage;
