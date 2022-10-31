import produce from 'immer'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { DeleteDialog } from './DeleteDialog'
import { Overlay as _Overlay } from './Overlay'

export function App() {
  const [columns, setColumns] = useState([
    {
      id: 'A',
      title: '未対応',
      cards: [
        { id: 'a', text: '👍いいね機能' },
        { id: 'b', text: '🖥️バッチ処理' },
        { id: 'c', text: '🗑️削除機能' },
      ],
    },
    {
      id: 'B',
      title: '処理中',
      cards: [{ id: 'd', text: '🧑🏻詳細表示' }],
    },
    {
      id: 'D',
      title: '処理済み',
      cards: [
        { id: 'f', text: '🌍一覧表示' },
        { id: 'g', text: '🔑ログイン機能' },
      ],
    },
  ])
  const [draggingCardID, setDraggingCardID] = useState<string | undefined>(
    undefined,
  )

  const dropCardTo = (toID: string) => {
    const fromID = draggingCardID
    if (!fromID) return

    setDraggingCardID(undefined)

    if (fromID === toID) return

    type Columns = typeof columns
    setColumns(
      produce((columns: Columns) => {
        const card = columns
          .flatMap(col => col.cards)
          .find(c => c.id === fromID)
        if (!card) return

        const fromColumn = columns.find(col =>
          col.cards.some(c => c.id === fromID),
        )
        if (!fromColumn) return

        fromColumn.cards = fromColumn.cards.filter(c => c.id !== fromID)

        const toColumn = columns.find(
          col => col.id === toID || col.cards.some(c => c.id === toID),
        )
        if (!toColumn) return

        let index = toColumn.cards.findIndex(c => c.id === toID)
        if (index < 0) {
          index = toColumn.cards.length
        }
        toColumn.cards.splice(index, 0, card)
      }),
    )
  }

  const [filterValue, setFilterValue] = useState('')

  const [deletingCardID, setDeletingCardID] = useState<string | undefined>(
    undefined,
  )
  const deleteCard = () => {
    const cardID = deletingCardID
    if (!cardID) return

    setDeletingCardID(undefined)

    type Columns = typeof columns
    setColumns(
      produce((columns: Columns) => {
        const column = columns.find(col => col.cards.some(c => c.id === cardID))
        if (!column) return

        column.cards = column.cards.filter(c => c.id !== cardID)
      }),
    )
  }

  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />

      <MainArea>
        <HorizontalScroll>
          {columns.map(({ id: columnID, title, cards }) => (
            <Column
              key={columnID}
              title={title}
              filterValue={filterValue}
              cards={cards}
              onCardDragStart={cardID => setDraggingCardID(cardID)}
              onCardDrop={entered => dropCardTo(entered ?? columnID)}
              onCardDeleteClick={cardID => setDeletingCardID(cardID)}
            />
          ))}
        </HorizontalScroll>
      </MainArea>
      {deletingCardID && (
        <Overlay onClick={() => setDeletingCardID(undefined)}>
          <DeleteDialog
            onConfirm={deleteCard}
            onCancel={() => setDeletingCardID(undefined)}
          />
        </Overlay>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  margin: 0;
  html,
  body {
    margin: 0;
    padding: 0;
  }
`

const Header = styled(_Header)`
  flex-shrink: 0;
`

const MainArea = styled.div`
  height: 100%;
  padding: 16px 0;
  overflow-y: auto;
`

const HorizontalScroll = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  justify-content: center;

  > * {
    margin-left: 16px;
    flex-shrink: 0;
  }

  ::after {
    display: block;
    flex: 0 0 16px;
    content: '';
  }
`

const Overlay = styled(_Overlay)`
  display: flex;
  justify-content: center;
  align-items: center;
`

export default App
