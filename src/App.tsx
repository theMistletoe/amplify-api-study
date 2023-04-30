import './App.css';
import { createTodo } from './graphql/mutations';
import { API, GraphQLQuery, graphqlOperation } from '@aws-amplify/api';
import { CreateTodoInput, CreateTodoMutation, UpdateTodoMutation, ListTodosQuery } from './API';
import { useEffect, useState } from 'react';

const todo: CreateTodoInput = { title: "My first todo", desc: "Hello world!" };

function App() {
  const [todoIds, setTodoIds] = useState<string[]>([""]);
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
        }
      }
    `, { input: { id: selectedTodoId || todoIds[0], title, _version: 20}})); // Error: Client version is greater than the corresponding server version.
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
        }
        nextToken
        startedAt
      }
    }`));
    console.log(todos);
    setTodoIds(todos.data?.listTodos?.items?.map((todo) => todo?.id || "") || []);
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
          {todoIds.map((id) => <option key={id} value={id}>{id}</option>)}
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
