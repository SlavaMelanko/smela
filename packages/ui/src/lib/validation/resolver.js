import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

export const createResolver = schema => yupResolver(yup.object().shape(schema))
