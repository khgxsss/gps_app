import React from 'react';
import firestore from '@react-native-firebase/firestore';
import { List } from 'react-native-paper';

interface TodoProps {
    id: string;
    title: string;
    complete: boolean;
}

function Todo({ id, title, complete }: TodoProps) {
    async function toggleComplete() {
        await firestore()
            .collection('todos')
            .doc(id)
            .update({
                complete: !complete,
            });
    }

    return (
        <List.Item
            title={title}
            onPress={() => toggleComplete()}
            left={props => (
                <List.Icon {...props} icon={complete ? 'check' : 'cancel'} />
            )}
        />
    );
}

export default React.memo(Todo);
