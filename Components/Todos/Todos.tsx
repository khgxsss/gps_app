import React, { useEffect, useState } from 'react';
import { FlatList, Button, View, Text, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Appbar } from 'react-native-paper';
import Todo from './Todo';

interface TodoType {
    id: string;
    title: string;
    complete: boolean;
}

function Todos() {
    const [todo, setTodo] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [todos, setTodos] = useState<TodoType[]>([]);
    const ref = firestore().collection('todos');

    async function addTodo() {
        await ref.add({
            title: todo,
            complete: false,
        });
        setTodo('');
    }

    useEffect(() => {
        return ref.onSnapshot(querySnapshot => {
            const list: TodoType[] = [];
            querySnapshot.forEach(doc => {
                const { title, complete } = doc.data();
                list.push({
                    id: doc.id,
                    title,
                    complete,
                });
            });

            setTodos(list);

            if (loading) {
                setLoading(false);
            }
        });
    }, []);

    if (loading) {
        return null; // or a spinner
    }

    return (
        <>
            <Appbar>
                <Appbar.Content title={'TODOs List'} />
            </Appbar>
            <FlatList
                style={{ flex: 1 }}
                data={todos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Todo {...item} />}
            />
            <TextInput label={'New Todo'} value={todo} onChangeText={setTodo} />
            <Button title='Add TODO' onPress={() => addTodo()} />
        </>
    );
}

export default Todos;
