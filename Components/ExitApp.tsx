import { Alert, BackHandler } from 'react-native';

const showExitAlert = () => {
    Alert.alert(
        "Exit App",
        "Do you want to exit the app?",
        [
            {
                text: "No",
                onPress: () => null,
                style: "cancel"
            },
            {
                text: "Yes",
                onPress: () => BackHandler.exitApp()
            }
        ],
        { cancelable: true }
    );
}

export default showExitAlert;
