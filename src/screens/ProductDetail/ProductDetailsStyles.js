import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: 300,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    dotContainer: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        margin: 4,
    },
    activeDot: {
        backgroundColor: '#ffffff',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    favIconContainer: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 8,
        elevation: 5,
    },
    infoSection: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
        paddingHorizontal: 20,
        paddingTop: 25,
        paddingBottom: 100,
    },
    nameAndPrice: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: '700',
    },
    ratingStockContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 14,
    },
    stockBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    productDescription: {
        fontSize: 14,
        lineHeight: 22,
    },
    nutritionContainer: {
        marginBottom: 20,
    },
    nutritionText: {
        fontSize: 14,
        lineHeight: 22,
        marginLeft: 4,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        elevation: 8,
    },
    cartButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
    },
    addButton: {
        flex: 1.5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default styles;