import './App.css';
import { createTodo } from './graphql/mutations';
import { API, GraphQLQuery, graphqlOperation } from '@aws-amplify/api';
import { CreateTodoInput, CreateTodoMutation, UpdateTodoMutation, ListTodosQuery } from './API';
import { useEffect, useState } from 'react';

const todo: CreateTodoInput = { title: "My first todo", desc: "Hello world!" };

function App() {
  const [todos, setTodos] = useState<any[]>([]);
  const [selectedTodoId, setSelectedTodoId] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const handleCreate = async () => {
    await API.graphql<GraphQLQuery<CreateTodoMutation>>(graphqlOperation(createTodo, {input: todo}));
  }

  const handleUpdate = async () => {
    try {
      const ret = await API.graphql<GraphQLQuery<UpdateTodoMutation>>(graphqlOperation(`
      mutation UpdateTodo(
        $input: UpdateTodoInput!
        $condition: ModelTodoConditionInput
      ) {
        updateTodo(input: $input, condition: $condition) {
          id
          title
          desc
          createdAt
          updatedAt
          _verion
        }
      }
    `, { input: {
      id: selectedTodoId || todos[0].id,
      title,
      // _version: todos.find((todo) => todo.id === selectedTodoId)._version
    }}));
      console.log(ret);
    } catch (error) {
      console.error(error);
    }
  }

  const handleFetch = async () => {
    const todos = await API.graphql<GraphQLQuery<ListTodosQuery>>(graphqlOperation(`query ListTodos(
      $filter: ModelTodoFilterInput
      $limit: Int
      $nextToken: String
    ) {
      listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items {
          id
          title
          desc
          createdAt
          updatedAt
          _verion
        }
        nextToken
        startedAt
      }
    }`));
    console.log(todos);
    setTodos(todos.data?.listTodos?.items || []);
  }

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <div className="App">
      <button onClick={handleCreate}>createTODO</button>
      <hr />
      <button onClick={handleFetch}>fetchTODO</button>
      <hr />
      <div>
        todoIDs: <select name="todoids" id="todoids" onChange={e => setSelectedTodoId(e.target.value)}>
          {todos.map((todo) => <option key={todo.id} value={todo.id}>{todo.id}</option>)}
        </select>
      </div>
      <div>
        updating title:
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div>
        <button onClick={handleUpdate}>updateTODO</button>
      </div>
  </div>
  );
}

export default App;
