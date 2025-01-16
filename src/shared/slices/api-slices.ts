import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  TSetLeaderboard,
  TGetLeaderboard,
  TLeaderboardItem,
} from '@/types'
import { API, METHODS } from '@/utils'

const defaultBaseQuery = fetchBaseQuery({
  baseUrl: API.Base,
  credentials: 'include',
})

export const apiSlices = createApi({
  reducerPath: 'api',
  tagTypes: ['User', 'Leaderboard', 'Topic', 'Reactions'],
  baseQuery: defaultBaseQuery,
  endpoints: builder => ({
    getLeaderboard: builder.query<TLeaderboardItem[], TGetLeaderboard>({
      query: (credentials: TGetLeaderboard) => ({
        method: METHODS.Post,
        url: `/leaderboard/${credentials.teamName}`,
        body: credentials,
      }),
      providesTags: ['Leaderboard'],
    }),

    setLeaderboard: builder.mutation({
      query: (credentials: TSetLeaderboard) => ({
        method: METHODS.Post,
        url: '/leaderboard',
        body: credentials,
      }),
      invalidatesTags: ['Leaderboard'],
    }),
  }),
})

export const {
  useGetLeaderboardQuery,
  useSetLeaderboardMutation,
} = apiSlices
