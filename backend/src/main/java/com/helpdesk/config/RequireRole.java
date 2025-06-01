package com.helpdesk.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom annotation for role-based access control.
 * Can be applied to methods to restrict access based on user roles.
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    /**
     * Roles that are allowed to access the annotated method.
     * @return Array of allowed roles
     */
    String[] value();
}
