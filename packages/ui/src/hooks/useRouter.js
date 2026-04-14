import {
  useLocation as useReactRouterLocation,
  useNavigate as useReactRouterNavigate,
  useOutletContext as useReactRouterOutletContext,
  useParams as useReactRouterParams,
  useRouteError as useReactRouterRouteError,
  useSearchParams as useReactRouterSearchParams
} from 'react-router-dom'

export const useNavigate = useReactRouterNavigate
export const useLocation = useReactRouterLocation
export const useParams = useReactRouterParams
export const useSearchParams = useReactRouterSearchParams
export const useOutletContext = useReactRouterOutletContext
export const useRouteError = useReactRouterRouteError

export {
  MemoryRouter,
  Navigate,
  Outlet,
  Link as RouterLink
} from 'react-router-dom'
