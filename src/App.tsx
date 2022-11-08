import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import produce from 'immer'
import { randomID, sortBy, reorderPatch } from './util'
import { Header as _Header } from './Header'
import { Column } from './Column'
import { DeleteDialog } from './DeleteDialog'
import { Overlay as _Overlay } from './Overlay'
import { ColumnID, CardID } from './api'
import { State as RootState } from './reducer'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import db from './firebase'
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

type State = {
  columns?: {
    id: ColumnID
    title?: string
    text?: string
    cards?: {
      id: CardID
      text?: string
    }[]
  }[]
  cardsOrder: Record<string, CardID | ColumnID>
}

export function App() {
  const dispatch = useDispatch()
  const filterValue = useSelector((state: RootState) => state.filterValue)
  const setFilterValue = (value: string) =>
    dispatch({
      type: 'Filter.SetFilter',
      payload: {
        value,
      },
    })
  const [{ columns, cardsOrder }, setData] = useState<State>({ cardsOrder: {} })

  useEffect(() => {
    ;(async () => {
      // const columns = await api('GET /v1/columns', null)

      // columns取得
      const querySnapshot1 = await getDocs(query(collection(db, 'columns')))
      const columns: any[] = []
      querySnapshot1.forEach(doc => {
        columns.push(doc.data())
      })

      setData(
        produce((draft: State) => {
          draft.columns = columns
        }),
      )

      // cards取得
      const querySnapshot2 = await getDocs(query(collection(db, 'cards')))
      const unorderedCards: any[] = []
      querySnapshot2.forEach(doc => {
        unorderedCards.push(doc.data())
      })

      // cardsOrder取得
      const querySnapshot3 = await getDocs(query(collection(db, 'cardsOrder')))
      const cardsOrder: Record<string, CardID | ColumnID> = {}
      querySnapshot3.forEach(doc => {
        cardsOrder[doc.data().id] = doc.data().next
      })

      // const [unorderedCards, cardsOrder] = await Promise.all([
      //   api('GET /v1/cards', null),
      //   api('GET /v1/cardsOrder', null),
      // ])
      // console.log(unorderedCards)
      // console.log(cardsOrder)

      setData(
        produce((draft: State) => {
          draft.cardsOrder = cardsOrder
          draft.columns?.forEach(column => {
            column.cards = sortBy(unorderedCards, cardsOrder, column.id)
          })
        }),
      )
    })()
  }, [])

  const [draggingCardID, setDraggingCardID] = useState<CardID | undefined>(
    undefined,
  )

  const dropCardTo = async (toID: CardID | ColumnID) => {
    const fromID = draggingCardID
    if (!fromID) return

    setDraggingCardID(undefined)

    if (fromID === toID) return

    const patch = reorderPatch(cardsOrder, fromID, toID)

    setData(
      produce((draft: State) => {
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }

        const unorderedCards = draft.columns?.flatMap(c => c.cards ?? []) ?? []
        draft.columns?.forEach(column => {
          column.cards = sortBy(unorderedCards, draft.cardsOrder, column.id)
        })
      }),
    )


    for (let key in patch) {
      let CardOrderDocId = ''
      const querySnapshot = await getDocs(
        query(collection(db, 'cardsOrder'), where('id', '==', key)),
      )
      querySnapshot.forEach(doc => {
        CardOrderDocId = doc.id
      })
      await updateDoc(doc(db, 'cardsOrder', CardOrderDocId), {
        id: key,
        next: patch[key]
      })
    }


    // api('PATCH /v1/cardsOrder', patch)
  }

  const setText = (columnID: ColumnID, value: string) => {
    setData(
      produce((draft: State) => {
        const column = draft.columns?.find(c => c.id === columnID)
        if (!column) return

        column.text = value
      }),
    )
  }

  //add
  const addCard = async (columnID: ColumnID) => {
    const column = columns?.find(c => c.id === columnID)
    if (!column) return

    const text = column.text
    const cardID = randomID() as CardID

    const patch = reorderPatch(cardsOrder, cardID, cardsOrder[columnID])

    setData(
      produce((draft: State) => {
        const column = draft.columns?.find(c => c.id === columnID)
        if (!column?.cards) return

        column.cards.unshift({
          id: cardID,
          text: column.text,
        })
        column.text = ''
        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }
      }),
    )
    // api('POST /v1/cards', {
    //   id: cardID,
    //   text,
    // })

    //cardsの追加
    await addDoc(collection(db, 'cards'), { id: cardID, text: text })
    //cardsOrderの追加
    await addDoc(collection(db, 'cardsOrder'), {
      id: cardID,
      next: patch[cardID],
    })

    const OtherCardId = Object.keys(patch).filter(key => {
      return patch[key] !== patch[cardID]
    })
    if (OtherCardId) {
      // cardsOrder情報取得、更新2
      let OtherCardDocId = ''
      const querySnapshot2 = await getDocs(
        query(collection(db, 'cardsOrder'), where('id', '==', OtherCardId[0])),
      )
      querySnapshot2.forEach(doc => {
        OtherCardDocId = doc.id
      })
      await updateDoc(doc(db, 'cardsOrder', OtherCardDocId), {
        id: OtherCardId[0],
        next: patch[OtherCardId[0]],
      })
    }

    // 確認用
    // console.log(patch)
    // console.log('a')
    // console.log(cardID)
    // console.log(patch[cardID])
    // console.log('b')
    // console.log(OtherCardId[0])
    // console.log(patch[OtherCardId[0]])

    // api('PATCH /v1/cardsOrder', patch)
  }

  // delete
  const [deletingCardID, setDeletingCardID] = useState<CardID | undefined>(
    undefined,
  )
  const deleteCard = async () => {
    const cardID = deletingCardID
    if (!cardID) return

    setDeletingCardID(undefined)

    const patch = reorderPatch(cardsOrder, cardID)

    setData(
      produce((draft: State) => {
        const column = draft.columns?.find(col =>
          col.cards?.some(c => c.id === cardID),
        )
        if (!column?.cards) return

        column.cards = column.cards.filter(c => c.id !== cardID)

        draft.cardsOrder = {
          ...draft.cardsOrder,
          ...patch,
        }
      }),
    )

    // api('DELETE /v1/cards', {
    //   id: cardID,
    // })
    console.log(patch)

    // cards削除
    let CardDocId = ''
    const querySnapshot1 = await getDocs(
      query(collection(db, 'cards'), where('id', '==', cardID)),
    )
    querySnapshot1.forEach(doc => {
      CardDocId = doc.id
    })
    await deleteDoc(doc(db, 'cards', CardDocId))

    // cardsOrder削除
    let CardOrderDocId = ''
    const querySnapshot2 = await getDocs(
      query(collection(db, 'cardsOrder'), where('id', '==', cardID)),
    )
    querySnapshot2.forEach(doc => {
      CardOrderDocId = doc.id
    })
    await deleteDoc(doc(db, 'cardsOrder', CardOrderDocId))

    // cardsOrder変更
    const OtherCardId = Object.keys(patch).filter(key => {
      return patch[key] !== patch[cardID]
    })
    if (OtherCardId) {
      let OtherCardDocId = ''
      const querySnapshot2 = await getDocs(
        query(collection(db, 'cardsOrder'), where('id', '==', OtherCardId[0])),
      )
      querySnapshot2.forEach(doc => {
        OtherCardDocId = doc.id
      })
      await updateDoc(doc(db, 'cardsOrder', OtherCardDocId), {
        id: OtherCardId[0],
        next: patch[OtherCardId[0]],
      })
    }

    // api('PATCH /v1/cardsOrder', patch)
  }

  return (
    <Container>
      <Header filterValue={filterValue} onFilterChange={setFilterValue} />

      <MainArea>
        <HorizontalScroll>
          {!columns ? (
            <Loading />
          ) : (
            columns.map(({ id: columnID, title, cards, text }) => (
              <Column
                key={columnID}
                title={title}
                filterValue={filterValue}
                cards={cards}
                onCardDragStart={cardID => setDraggingCardID(cardID)}
                onCardDrop={entered => dropCardTo(entered ?? columnID)}
                onCardDeleteClick={cardID => setDeletingCardID(cardID)}
                text={text}
                onTextChange={value => setText(columnID, value)}
                onTextConfirm={() => addCard(columnID)}
              />
            ))
          )}
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

const Loading = styled.div.attrs({
  children: 'Loading...',
})`
  font-size: 14px;
`

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
